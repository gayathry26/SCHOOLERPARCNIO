import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [
      categories,
      assets,
      vendors,
      purchaseRequests,
      purchaseOrders,
      stockMovements,
      maintenanceLogs,
      auditSessions,
      departments,
      users,
    ] = await Promise.all([
      prisma.assetCategory.findMany({ orderBy: { name: 'asc' } }),
      prisma.assetItem.findMany({
        include: {
          category: true,
          vendor: true,
          assignedDepartment: true,
          issues: {
            include: { issuedTo: true },
            where: { returnDate: null },
          },
          movements: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
          maintenanceLogs: {
            take: 5,
            orderBy: { serviceDate: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.assetVendor.findMany({ orderBy: { name: 'asc' } }),
      prisma.purchaseRequest.findMany({
        include: { requestedBy: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.purchaseOrder.findMany({
        include: { vendor: true, items: true, grns: true },
        orderBy: { orderDate: 'desc' },
      }),
      prisma.stockMovement.findMany({
        include: { assetItem: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.assetMaintenanceLog.findMany({
        include: { assetItem: true },
        orderBy: { serviceDate: 'desc' },
      }),
      prisma.stockAuditSession.findMany({
        include: { items: { include: { assetItem: true } } },
        orderBy: { auditDate: 'desc' },
      }),
      prisma.department.findMany({ orderBy: { name: 'asc' } }),
      prisma.user.findMany({
        where: {
          role: { in: ['TEACHER', 'CLASS_TEACHER', 'HR_MANAGER', 'ACCOUNTANT', 'LIBRARIAN', 'SCHOOL_ADMIN', 'PRINCIPAL'] },
        },
        select: { id: true, firstName: true, lastName: true, role: true },
      }),
    ]);

    return NextResponse.json({
      categories,
      assets,
      vendors,
      purchaseRequests,
      purchaseOrders,
      stockMovements,
      maintenanceLogs,
      auditSessions,
      departments,
      users,
    });
  } catch (error: any) {
    console.error('Inventory API GET error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    const INVENTORY_STAFF = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'LIBRARIAN'];

    // 1. CREATE ITEM / ASSET MASTER
    if (action === 'CREATE_ASSET' || action === 'CREATE_ITEM') {
      if (!INVENTORY_STAFF.includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const {
        name,
        categoryId,
        vendorId,
        location,
        unit,
        purchaseCost,
        unitPrice,
        currentQuantity,
        minStockThreshold,
        maxStockThreshold,
        reorderLevel,
        condition,
        isConsumable,
        serialNumber,
        amcDetails,
        warrantyExpiry,
        assignedDepartmentId,
        depreciationRate,
      } = body;

      if (!name || !categoryId) {
        return NextResponse.json({ error: 'Item name and category are required' }, { status: 400 });
      }

      const prefix = isConsumable ? 'INV' : 'AST';
      const randSuffix = Math.floor(1000 + Math.random() * 9000);
      const assetCode = body.assetCode || `${prefix}-${Date.now().toString().slice(-4)}-${randSuffix}`;
      const barcode = body.barcode || `890${Date.now().toString().slice(-9)}`;
      const qrCode = `QR-${assetCode}`;
      const qty = parseInt(currentQuantity) || 0;
      const cost = parseFloat(purchaseCost) || 0;

      const asset = await prisma.assetItem.create({
        data: {
          assetCode,
          barcode,
          qrCode,
          name,
          categoryId,
          vendorId: vendorId || null,
          location: location || 'Main Campus Store',
          unit: unit || 'PIECES',
          purchaseCost: cost,
          unitPrice: parseFloat(unitPrice) || cost,
          currentQuantity: qty,
          minStockThreshold: parseInt(minStockThreshold) || 2,
          maxStockThreshold: parseInt(maxStockThreshold) || 100,
          reorderLevel: parseInt(reorderLevel) || 5,
          condition: condition || 'EXCELLENT',
          isConsumable: Boolean(isConsumable),
          serialNumber: serialNumber || null,
          amcDetails: amcDetails || null,
          warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
          assignedDepartmentId: assignedDepartmentId || null,
          depreciationRate: parseFloat(depreciationRate) || 10.0,
        },
        include: { category: true, vendor: true, assignedDepartment: true },
      });

      // Initial Stock Movement
      if (qty > 0) {
        await prisma.stockMovement.create({
          data: {
            assetItemId: asset.id,
            movementType: 'STOCK_IN',
            quantity: qty,
            previousQuantity: 0,
            newQuantity: qty,
            toLocation: asset.location,
            referenceNumber: 'INIT-ENTRY',
            unitCost: cost,
            totalCost: cost * qty,
            reason: 'Initial item registration and opening stock entry',
            recordedBy: `${user.firstName} ${user.lastName || ''}`.trim(),
          },
        });
      }

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'CREATE_INVENTORY_ITEM',
        module: 'INVENTORY',
        recordId: asset.id,
        newValue: `Created item ${asset.assetCode} (${asset.name}) in ${asset.location}`,
      });

      return NextResponse.json({ success: true, asset });
    }

    // 2. STOCK ADJUSTMENT, TRANSFER, DAMAGE
    if (action === 'RECORD_STOCK_MOVEMENT') {
      if (!INVENTORY_STAFF.includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { assetItemId, movementType, quantity, fromLocation, toLocation, referenceNumber, unitCost, reason } = body;
      if (!assetItemId || !movementType || quantity === undefined) {
        return NextResponse.json({ error: 'Asset, movement type, and quantity required' }, { status: 400 });
      }

      const asset = await prisma.assetItem.findUnique({ where: { id: assetItemId } });
      if (!asset) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

      const qty = parseInt(quantity);
      let newQty = asset.currentQuantity;
      if (['STOCK_IN', 'RETURN'].includes(movementType)) {
        newQty += qty;
      } else if (['STOCK_OUT', 'ISSUE', 'DAMAGE', 'DISPOSAL'].includes(movementType)) {
        if (asset.currentQuantity < qty) {
          return NextResponse.json({ error: `Insufficient stock (${asset.currentQuantity}) for ${movementType}` }, { status: 400 });
        }
        newQty -= qty;
      } else if (movementType === 'ADJUSTMENT') {
        newQty = qty; // direct adjustment to physical count
      }

      const movement = await prisma.stockMovement.create({
        data: {
          assetItemId,
          movementType,
          quantity: qty,
          previousQuantity: asset.currentQuantity,
          newQuantity: newQty,
          fromLocation: fromLocation || asset.location,
          toLocation: toLocation || asset.location,
          referenceNumber: referenceNumber || `MOV-${Date.now().toString().slice(-6)}`,
          unitCost: parseFloat(unitCost) || asset.purchaseCost,
          totalCost: (parseFloat(unitCost) || asset.purchaseCost) * qty,
          reason: reason || `Manual ${movementType} recorded`,
          recordedBy: `${user.firstName} ${user.lastName || ''}`.trim(),
        },
        include: { assetItem: true },
      });

      const updateData: any = { currentQuantity: newQty };
      if (toLocation && movementType === 'TRANSFER') {
        updateData.location = toLocation;
      }
      if (movementType === 'DAMAGE' && newQty === 0) {
        updateData.condition = 'DAMAGED';
      }

      await prisma.assetItem.update({
        where: { id: assetItemId },
        data: updateData,
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: `STOCK_MOVEMENT_${movementType}`,
        module: 'INVENTORY',
        recordId: asset.id,
        newValue: `${movementType}: ${qty} units. Stock: ${asset.currentQuantity} -> ${newQty}`,
      });

      return NextResponse.json({ success: true, movement, newQuantity: newQty });
    }

    // 3. ISSUE ASSET
    if (action === 'ISSUE_ASSET') {
      if (!INVENTORY_STAFF.includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { assetId, issuedToUserId, returnDueDate, quantity = 1, remarks } = body;
      if (!assetId || !issuedToUserId) {
        return NextResponse.json({ error: 'Asset and recipient staff user are required' }, { status: 400 });
      }

      const asset = await prisma.assetItem.findUnique({ where: { id: assetId } });
      const qty = parseInt(quantity) || 1;
      if (!asset || asset.currentQuantity < qty) {
        return NextResponse.json({ error: 'Insufficient stock available for issue' }, { status: 400 });
      }

      const issue = await prisma.assetIssueRecord.create({
        data: {
          assetId,
          issuedToUserId,
          quantity: qty,
          returnDueDate: new Date(returnDueDate || Date.now() + 86400000 * 14),
          remarks: remarks || 'Issued for institutional duties',
        },
        include: { asset: true, issuedTo: true },
      });

      const newQty = asset.currentQuantity - qty;
      await prisma.assetItem.update({
        where: { id: assetId },
        data: { currentQuantity: newQty },
      });

      await prisma.stockMovement.create({
        data: {
          assetItemId: assetId,
          movementType: 'ISSUE',
          quantity: qty,
          previousQuantity: asset.currentQuantity,
          newQuantity: newQty,
          fromLocation: asset.location,
          toLocation: `Custodian: ${issue.issuedTo.firstName} ${issue.issuedTo.lastName || ''}`,
          referenceNumber: `ISSUE-${issue.id.slice(-6)}`,
          unitCost: asset.purchaseCost,
          totalCost: asset.purchaseCost * qty,
          reason: remarks || `Issued to staff member`,
          recordedBy: `${user.firstName} ${user.lastName || ''}`.trim(),
        },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'ISSUE_INVENTORY_ASSET',
        module: 'INVENTORY',
        recordId: issue.id,
        newValue: `Issued ${qty} units of ${asset.name} to ${issue.issuedTo.firstName}`,
      });

      return NextResponse.json({ success: true, issue });
    }

    // 4. RETURN ASSET
    if (action === 'RETURN_ASSET') {
      if (!INVENTORY_STAFF.includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { issueId, conditionReturn, remarks } = body;
      const issue = await prisma.assetIssueRecord.findUnique({
        where: { id: issueId },
        include: { asset: true, issuedTo: true },
      });
      if (!issue) return NextResponse.json({ error: 'Issue record not found' }, { status: 404 });

      const updatedIssue = await prisma.assetIssueRecord.update({
        where: { id: issueId },
        data: {
          returnDate: new Date(),
          conditionReturn: conditionReturn || 'GOOD',
          remarks: remarks || issue.remarks,
        },
      });

      const asset = issue.asset;
      const newQty = asset.currentQuantity + issue.quantity;
      await prisma.assetItem.update({
        where: { id: asset.id },
        data: {
          currentQuantity: newQty,
          condition: conditionReturn || asset.condition,
        },
      });

      await prisma.stockMovement.create({
        data: {
          assetItemId: asset.id,
          movementType: 'RETURN',
          quantity: issue.quantity,
          previousQuantity: asset.currentQuantity,
          newQuantity: newQty,
          fromLocation: `Custodian: ${issue.issuedTo.firstName}`,
          toLocation: asset.location,
          referenceNumber: `RET-${issue.id.slice(-6)}`,
          unitCost: asset.purchaseCost,
          totalCost: asset.purchaseCost * issue.quantity,
          reason: `Returned from staff. Condition: ${conditionReturn || 'GOOD'}`,
          recordedBy: `${user.firstName} ${user.lastName || ''}`.trim(),
        },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'RETURN_INVENTORY_ASSET',
        module: 'INVENTORY',
        recordId: updatedIssue.id,
        newValue: `Returned asset ${asset.name} (Condition: ${conditionReturn || 'GOOD'})`,
      });

      return NextResponse.json({ success: true, issue: updatedIssue });
    }

    // 5. ASSET DISPOSAL
    if (action === 'DISPOSE_ASSET') {
      if (!['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { assetId, disposalMethod, disposalValue, disposalReason } = body;
      const asset = await prisma.assetItem.findUnique({ where: { id: assetId } });
      if (!asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });

      const updated = await prisma.assetItem.update({
        where: { id: assetId },
        data: {
          condition: 'DISPOSED',
          disposalDate: new Date(),
          disposalMethod: disposalMethod || 'SCRAPPED',
          disposalValue: parseFloat(disposalValue) || 0,
          disposalReason: disposalReason || 'End of serviceable lifecycle',
        },
      });

      await prisma.stockMovement.create({
        data: {
          assetItemId: asset.id,
          movementType: 'DISPOSAL',
          quantity: asset.currentQuantity,
          previousQuantity: asset.currentQuantity,
          newQuantity: 0,
          fromLocation: asset.location,
          toLocation: `Disposed via ${disposalMethod || 'SCRAPPED'}`,
          referenceNumber: `DISP-${asset.assetCode}`,
          unitCost: asset.purchaseCost,
          totalCost: parseFloat(disposalValue) || 0,
          reason: disposalReason || 'Asset officially condemned and written off',
          recordedBy: `${user.firstName} ${user.lastName || ''}`.trim(),
        },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'DISPOSE_ASSET',
        module: 'INVENTORY',
        recordId: asset.id,
        newValue: `Disposed ${asset.assetCode} via ${disposalMethod}: ₹${disposalValue || 0}`,
      });

      return NextResponse.json({ success: true, asset: updated });
    }

    // 6. PURCHASE REQUEST
    if (action === 'PURCHASE_REQUEST') {
      const { itemTitle, categoryName, departmentName, priority, quantity, estimatedCost, reason, quotationRef, quotationVendor, quotationAmount } = body;
      if (!itemTitle || !reason) {
        return NextResponse.json({ error: 'Item title and purchase reason required' }, { status: 400 });
      }

      const pr = await prisma.purchaseRequest.create({
        data: {
          itemTitle,
          categoryName: categoryName || 'General Supplies',
          departmentName: departmentName || 'Academics',
          priority: priority || 'MEDIUM',
          quantity: parseInt(quantity) || 1,
          estimatedCost: parseFloat(estimatedCost) || 5000,
          reason,
          requestedByUserId: user.id,
          status: 'PENDING',
          quotationRef: quotationRef || null,
          quotationVendor: quotationVendor || null,
          quotationAmount: quotationAmount ? parseFloat(quotationAmount) : null,
        },
        include: { requestedBy: true },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'CREATE_PURCHASE_REQUEST',
        module: 'INVENTORY',
        recordId: pr.id,
        newValue: `Purchase request: ${itemTitle} (${quantity} units, Est: ₹${estimatedCost})`,
      });

      return NextResponse.json({ success: true, purchaseRequest: pr });
    }

    // 7. APPROVE / ENDORSE PURCHASE REQUEST
    if (action === 'APPROVE_PURCHASE') {
      const APPROVERS = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT'];
      if (!APPROVERS.includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { requestId, status, endorsementNotes } = body;
      const updated = await prisma.purchaseRequest.update({
        where: { id: requestId },
        data: {
          status: status || 'APPROVED',
          approvedByUserId: user.id,
          endorsementNotes: endorsementNotes || undefined,
        },
        include: { requestedBy: true },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'APPROVE_PURCHASE_REQUEST',
        module: 'INVENTORY',
        recordId: updated.id,
        newValue: `Updated PR status to ${status || 'APPROVED'}`,
      });

      return NextResponse.json({ success: true, purchaseRequest: updated });
    }

    // 8. CREATE PURCHASE ORDER (PO)
    if (action === 'CREATE_PURCHASE_ORDER') {
      if (!INVENTORY_STAFF.includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { purchaseRequestId, vendorId, expectedDeliveryDate, paymentTerms, notes, items } = body;
      if (!vendorId || !items || !items.length) {
        return NextResponse.json({ error: 'Vendor and order line items required' }, { status: 400 });
      }

      const poNumber = `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      let subtotal = 0;
      const orderItems = items.map((it: any) => {
        const lineTotal = (parseInt(it.quantity) || 1) * (parseFloat(it.unitPrice) || 0);
        subtotal += lineTotal;
        return {
          itemTitle: it.itemTitle,
          quantity: parseInt(it.quantity) || 1,
          unitPrice: parseFloat(it.unitPrice) || 0,
          totalPrice: lineTotal,
          assetItemId: it.assetItemId || null,
        };
      });

      const taxAmount = subtotal * 0.18; // 18% GST standard
      const totalAmount = subtotal + taxAmount;

      const po = await prisma.purchaseOrder.create({
        data: {
          poNumber,
          purchaseRequestId: purchaseRequestId || null,
          vendorId,
          orderDate: new Date(),
          expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
          status: 'ISSUED',
          subtotal,
          taxAmount,
          totalAmount,
          paymentTerms: paymentTerms || 'Net 30 Days',
          notes: notes || null,
          createdByName: `${user.firstName} ${user.lastName || ''}`.trim(),
          items: {
            create: orderItems,
          },
        },
        include: { vendor: true, items: true },
      });

      if (purchaseRequestId) {
        await prisma.purchaseRequest.update({
          where: { id: purchaseRequestId },
          data: { status: 'ORDERED' },
        });
      }

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'CREATE_PURCHASE_ORDER',
        module: 'INVENTORY',
        recordId: po.id,
        newValue: `Created PO ${poNumber} for ₹${totalAmount.toLocaleString('en-IN')}`,
      });

      return NextResponse.json({ success: true, purchaseOrder: po });
    }

    // 9. GOODS RECEIVED NOTE (GRN) & INVOICE TRACKING
    if (action === 'RECORD_GRN') {
      if (!INVENTORY_STAFF.includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { purchaseOrderId, invoiceNumber, invoiceDate, invoiceAmount, paymentStatus, paymentMode, transactionRef, remarks } = body;
      if (!purchaseOrderId) {
        return NextResponse.json({ error: 'Purchase order ID required' }, { status: 400 });
      }

      const po = await prisma.purchaseOrder.findUnique({
        where: { id: purchaseOrderId },
        include: { items: true, vendor: true },
      });
      if (!po) return NextResponse.json({ error: 'PO not found' }, { status: 404 });

      const grnNumber = `GRN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const grn = await prisma.goodsReceivedNote.create({
        data: {
          grnNumber,
          purchaseOrderId,
          receivedDate: new Date(),
          receivedByName: `${user.firstName} ${user.lastName || ''}`.trim(),
          invoiceNumber: invoiceNumber || null,
          invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
          invoiceAmount: invoiceAmount ? parseFloat(invoiceAmount) : po.totalAmount,
          paymentStatus: paymentStatus || 'PAID',
          paymentMode: paymentMode || 'ONLINE_BANK_TRANSFER',
          transactionRef: transactionRef || null,
          remarks: remarks || 'Shipment received, verified, and checked into central inventory stores.',
        },
      });

      // Update PO status to DELIVERED and increment stock
      await prisma.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: { status: 'DELIVERED' },
      });

      for (const it of po.items) {
        if (it.assetItemId) {
          const item = await prisma.assetItem.findUnique({ where: { id: it.assetItemId } });
          if (item) {
            const newQty = item.currentQuantity + it.quantity;
            await prisma.assetItem.update({
              where: { id: item.id },
              data: { currentQuantity: newQty },
            });
            await prisma.stockMovement.create({
              data: {
                assetItemId: item.id,
                movementType: 'STOCK_IN',
                quantity: it.quantity,
                previousQuantity: item.currentQuantity,
                newQuantity: newQty,
                fromLocation: po.vendor.name,
                toLocation: item.location,
                referenceNumber: grnNumber,
                unitCost: it.unitPrice,
                totalCost: it.totalPrice,
                reason: `GRN against PO ${po.poNumber}`,
                recordedBy: `${user.firstName} ${user.lastName || ''}`.trim(),
              },
            });
          }
        }
      }

      // Record in accounting expense vouchers if paid
      if (paymentStatus === 'PAID') {
        const expCat = await prisma.expenseCategory.findFirst({ where: { name: 'Operations & Facilities' } });
        if (expCat) {
          await prisma.expenseVoucher.create({
            data: {
              voucherNumber: `VCH-${grnNumber}`,
              categoryId: expCat.id,
              title: `Procurement payment for PO ${po.poNumber} (${grn.grnNumber})`,
              vendorName: po.vendor.name,
              vendorInvoice: invoiceNumber || grnNumber,
              amount: invoiceAmount ? parseFloat(invoiceAmount) : po.totalAmount,
              paymentMode: paymentMode || 'BANK_TRANSFER',
              status: 'PAID',
              notes: `Transaction ref: ${transactionRef || 'N/A'}. Prepared by: ${user.firstName} ${user.lastName || ''}`.trim(),
            },
          });
        }
      }

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'RECORD_GRN',
        module: 'INVENTORY',
        recordId: grn.id,
        newValue: `Goods Received ${grnNumber} for PO ${po.poNumber}`,
      });

      return NextResponse.json({ success: true, grn });
    }

    // 10. ASSET MAINTENANCE LOG
    if (action === 'RECORD_MAINTENANCE') {
      if (!INVENTORY_STAFF.includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { assetItemId, maintenanceType, serviceProvider, technicianName, technicianContact, description, cost, status, nextServiceDate } = body;
      if (!assetItemId || !description || !serviceProvider) {
        return NextResponse.json({ error: 'Asset, description, and service provider required' }, { status: 400 });
      }

      const log = await prisma.assetMaintenanceLog.create({
        data: {
          assetItemId,
          maintenanceType: maintenanceType || 'PREVENTIVE',
          serviceDate: new Date(),
          serviceProvider,
          technicianName: technicianName || null,
          technicianContact: technicianContact || null,
          description,
          cost: parseFloat(cost) || 0,
          status: status || 'COMPLETED',
          nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null,
          recordedByName: `${user.firstName} ${user.lastName || ''}`.trim(),
        },
        include: { assetItem: true },
      });

      if (status === 'COMPLETED') {
        await prisma.assetItem.update({
          where: { id: assetItemId },
          data: { condition: 'EXCELLENT' },
        });
      } else if (status === 'IN_PROGRESS' || status === 'SCHEDULED') {
        await prisma.assetItem.update({
          where: { id: assetItemId },
          data: { condition: 'NEEDS_REPAIR' },
        });
      }

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'RECORD_ASSET_MAINTENANCE',
        module: 'INVENTORY',
        recordId: log.id,
        newValue: `Maintenance on ${log.assetItem.name}: ₹${cost || 0}`,
      });

      return NextResponse.json({ success: true, maintenanceLog: log });
    }

    // 11. STOCK AUDIT RECONCILIATION
    if (action === 'RECORD_STOCK_AUDIT') {
      if (!['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT'].includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { auditorName, departmentName, remarks, items } = body;
      if (!items || !items.length) {
        return NextResponse.json({ error: 'Audit verification items required' }, { status: 400 });
      }

      const auditCode = `AUD-2026-${Math.floor(100 + Math.random() * 900)}`;
      const audit = await prisma.stockAuditSession.create({
        data: {
          auditCode,
          auditDate: new Date(),
          auditorName: auditorName || `${user.firstName} ${user.lastName || ''}`.trim(),
          departmentName: departmentName || 'All Stores',
          status: 'COMPLETED',
          remarks: remarks || 'Physical stock audit completed.',
          items: {
            create: items.map((it: any) => ({
              assetItemId: it.assetItemId,
              systemQuantity: parseInt(it.systemQuantity) || 0,
              physicalQuantity: parseInt(it.physicalQuantity) || 0,
              discrepancy: (parseInt(it.physicalQuantity) || 0) - (parseInt(it.systemQuantity) || 0),
              unitCost: parseFloat(it.unitCost) || 0,
              discrepancyValue: ((parseInt(it.physicalQuantity) || 0) - (parseInt(it.systemQuantity) || 0)) * (parseFloat(it.unitCost) || 0),
              reason: it.reason || null,
              reconciled: Boolean(it.reconcile),
            })),
          },
        },
        include: { items: { include: { assetItem: true } } },
      });

      // Auto-reconcile items if marked
      for (const it of items) {
        if (it.reconcile && it.assetItemId) {
          const phys = parseInt(it.physicalQuantity) || 0;
          const sys = parseInt(it.systemQuantity) || 0;
          if (phys !== sys) {
            await prisma.assetItem.update({
              where: { id: it.assetItemId },
              data: { currentQuantity: phys },
            });
            await prisma.stockMovement.create({
              data: {
                assetItemId: it.assetItemId,
                movementType: 'ADJUSTMENT',
                quantity: Math.abs(phys - sys),
                previousQuantity: sys,
                newQuantity: phys,
                referenceNumber: auditCode,
                reason: it.reason || `Auditor physical stock count reconciliation`,
                recordedBy: `${user.firstName} ${user.lastName || ''}`.trim(),
              },
            });
          }
        }
      }

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'RECORD_STOCK_AUDIT',
        module: 'INVENTORY',
        recordId: audit.id,
        newValue: `Recorded physical stock audit ${auditCode}`,
      });

      return NextResponse.json({ success: true, auditSession: audit });
    }

    // 12. CREATE VENDOR
    if (action === 'CREATE_VENDOR') {
      if (!INVENTORY_STAFF.includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { name, contactPerson, phone, email, address, gstNumber, category, paymentTerms } = body;
      if (!name || !phone) {
        return NextResponse.json({ error: 'Vendor name and phone number required' }, { status: 400 });
      }

      const vendorCode = `VND-${Math.floor(100 + Math.random() * 900)}`;
      const vendor = await prisma.assetVendor.create({
        data: {
          vendorCode,
          name,
          contactPerson: contactPerson || null,
          phone,
          email: email || null,
          address: address || null,
          gstNumber: gstNumber || null,
          category: category || 'General Supplies',
          paymentTerms: paymentTerms || 'Net 30 Days',
        },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'CREATE_VENDOR',
        module: 'INVENTORY',
        recordId: vendor.id,
        newValue: `Created vendor ${vendor.name} (${vendor.vendorCode})`,
      });

      return NextResponse.json({ success: true, vendor });
    }

    // 13. CREATE CATEGORY
    if (action === 'CREATE_CATEGORY') {
      if (!INVENTORY_STAFF.includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { name, code, isAsset, description } = body;
      if (!name) return NextResponse.json({ error: 'Category name required' }, { status: 400 });

      const catCode = code || `CAT-${name.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
      const category = await prisma.assetCategory.create({
        data: {
          name,
          code: catCode,
          isAsset: Boolean(isAsset),
          description: description || null,
        },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'CREATE_INVENTORY_CATEGORY',
        module: 'INVENTORY',
        recordId: category.id,
        newValue: `Created category ${category.name} (${category.code})`,
      });

      return NextResponse.json({ success: true, category });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Inventory API error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
