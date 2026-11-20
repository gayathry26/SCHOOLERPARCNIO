import { prisma } from '../../lib/prisma';

async function seedInventory() {
  console.log('--- Seeding Inventory, Procurement & Asset Management Data ---');

  const school = await prisma.school.findFirst() || await prisma.school.create({
    data: {
      id: 'edvonest-main-school',
      name: 'Edvonest Model International Academy',
    }
  });

  const admin = await prisma.user.findFirst({ where: { role: 'SCHOOL_ADMIN' } });
  const teacher = await prisma.user.findFirst({ where: { role: 'TEACHER' } });
  const deptAcademics = await prisma.department.findFirst({ where: { name: { contains: 'Academic' } } });
  const deptAdmin = await prisma.department.findFirst({ where: { name: { contains: 'Admin' } } });

  // 1. Categories
  const categoriesData = [
    { name: 'Books & Textbooks', code: 'CAT-BOK', isAsset: false, description: 'Academic curriculum textbooks, reference guides, and library titles' },
    { name: 'Uniforms & Apparel', code: 'CAT-UNI', isAsset: false, description: 'Student blazers, shirts, trousers, skirts, ties, and sports tracksuits' },
    { name: 'Stationery Supplies', code: 'CAT-STA', isAsset: false, description: 'Notebooks, examination answer sheets, markers, chart papers, and pens' },
    { name: 'Computers & IT Hardware', code: 'CAT-CMP', isAsset: true, description: 'Desktops, laptops, smartboards, servers, routers, and projectors' },
    { name: 'Laboratory Equipment', code: 'CAT-LAB', isAsset: true, description: 'Physics, Chemistry, and Biology apparatus, microscopes, and glassware' },
    { name: 'Sports Equipment', code: 'CAT-SPT', isAsset: true, description: 'Cricket kits, basketballs, footballs, gymnastics mats, and athletic gear' },
    { name: 'Furniture & Fixtures', code: 'CAT-FUR', isAsset: true, description: 'Dual student desks, teacher podiums, library racks, and office chairs' },
    { name: 'Electrical Equipment', code: 'CAT-ELE', isAsset: true, description: 'UPS systems, backup generators, air conditioners, sound systems, and PA amplifiers' },
    { name: 'Cleaning & Housekeeping', code: 'CAT-CLN', isAsset: false, description: 'Disinfectants, sanitation liquids, mops, waste bins, and industrial vacuum units' },
    { name: 'Office Supplies', code: 'CAT-OFF', isAsset: false, description: 'Copier paper, toner cartridges, official registers, file folders, and stamps' },
    { name: 'School Capital Assets', code: 'CAT-AST', isAsset: true, description: 'Campus infrastructure, school buses, security camera networks, and digital bells' },
  ];

  const catMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const record = await prisma.assetCategory.upsert({
      where: { code: cat.code },
      update: { name: cat.name, isAsset: cat.isAsset, description: cat.description },
      create: { name: cat.name, code: cat.code, isAsset: cat.isAsset, description: cat.description },
    });
    catMap.set(cat.code, record.id);
  }
  console.log(`Upserted ${catMap.size} Inventory Categories`);

  // 2. Vendors
  const vendorsData = [
    {
      name: 'Oxford Educational Books & Publishers',
      vendorCode: 'VND-BOK-01',
      contactPerson: 'Sunil Malhotra',
      phone: '+91 11 4152 7890',
      email: 'sales@oxfordbooks-edu.com',
      address: 'Ansari Road, Daryaganj, New Delhi',
      gstNumber: '07AAAFO1234C1Z5',
      category: 'Books & Textbooks',
      rating: 4.8,
    },
    {
      name: 'Standard Uniforms & Tailoring Mart',
      vendorCode: 'VND-UNI-02',
      contactPerson: 'Kavita Saxena',
      phone: '+91 120 498 1122',
      email: 'orders@standarduniforms.in',
      address: 'Sector 18 Market, Noida, UP',
      gstNumber: '09AABCS8899D1ZQ',
      category: 'Uniforms & Apparel',
      rating: 4.6,
    },
    {
      name: 'Apex Infotech Solutions (HP & Dell Gold)',
      vendorCode: 'VND-CMP-03',
      contactPerson: 'Amitabh Sen',
      phone: '+91 11 2629 4400',
      email: 'enterprise@apexinfotech.co.in',
      address: 'Nehru Place Commercial Complex, New Delhi',
      gstNumber: '07AAACA9921E1Z8',
      category: 'Computers & IT Hardware',
      rating: 4.9,
    },
    {
      name: 'Borosil Scientific Apparatus & Reagents',
      vendorCode: 'VND-LAB-04',
      contactPerson: 'Dr. R. K. Singhal',
      phone: '+91 22 6740 5500',
      email: 'scientific@borosil-edu.com',
      address: 'Andheri East Industrial Estate, Mumbai',
      gstNumber: '27AAACB4411P1Z2',
      category: 'Laboratory Equipment',
      rating: 4.7,
    },
    {
      name: 'Godrej Interio Institutional Furniture',
      vendorCode: 'VND-FUR-05',
      contactPerson: 'Manish Tyagi',
      phone: '+91 11 4567 8901',
      email: 'institutional@godrejinterio.com',
      address: 'Okhla Phase III, New Delhi',
      gstNumber: '07AAACG1122K1Z9',
      category: 'Furniture & Fixtures',
      rating: 4.9,
    },
  ];

  const vendorMap = new Map<string, string>();
  for (const v of vendorsData) {
    const record = await prisma.assetVendor.upsert({
      where: { vendorCode: v.vendorCode },
      update: { name: v.name, phone: v.phone, email: v.email, rating: v.rating, address: v.address, gstNumber: v.gstNumber, category: v.category },
      create: v,
    });
    vendorMap.set(v.vendorCode, record.id);
  }
  console.log(`Upserted ${vendorMap.size} Vendors`);

  // 3. Item Master & Assets
  const itemsData = [
    {
      assetCode: 'AST-CMP-101',
      barcode: '890123456001',
      qrCode: 'QR-AST-CMP-101',
      name: 'HP ProDesk 400 G7 Core i5 Desktops',
      categoryCode: 'CAT-CMP',
      vendorCode: 'VND-CMP-03',
      location: 'Computer Science Lab 1 (Block B)',
      unit: 'SETS',
      purchaseCost: 52000,
      unitPrice: 52000,
      currentQuantity: 35,
      minStockThreshold: 5,
      maxStockThreshold: 50,
      reorderLevel: 8,
      condition: 'EXCELLENT',
      isConsumable: false,
      serialNumber: 'HP-PD-2026-8891',
      amcDetails: 'Apex 3-Year On-Site Comprehensive Support AMC',
      warrantyExpiry: new Date('2028-06-30'),
      depreciationRate: 20.0,
      assignedDepartmentId: deptAcademics?.id,
    },
    {
      assetCode: 'AST-LAB-201',
      barcode: '890123456002',
      qrCode: 'QR-AST-LAB-201',
      name: 'Compound Optical Research Microscopes 1000x',
      categoryCode: 'CAT-LAB',
      vendorCode: 'VND-LAB-04',
      location: 'Senior Biology Laboratory',
      unit: 'PIECES',
      purchaseCost: 14500,
      unitPrice: 14500,
      currentQuantity: 24,
      minStockThreshold: 4,
      maxStockThreshold: 30,
      reorderLevel: 6,
      condition: 'GOOD',
      isConsumable: false,
      serialNumber: 'BRS-MIC-7712',
      amcDetails: 'Annual optical calibration contract',
      warrantyExpiry: new Date('2027-12-31'),
      depreciationRate: 15.0,
      assignedDepartmentId: deptAcademics?.id,
    },
    {
      assetCode: 'INV-BOK-301',
      barcode: '890123456003',
      qrCode: 'QR-INV-BOK-301',
      name: 'NCERT Mathematics Class 10 Textbook (Batch 2026)',
      categoryCode: 'CAT-BOK',
      vendorCode: 'VND-BOK-01',
      location: 'Main Academic Book Store',
      unit: 'COPIES',
      purchaseCost: 180,
      unitPrice: 210,
      currentQuantity: 18,
      minStockThreshold: 25, // LOW STOCK TRIGGER!
      maxStockThreshold: 200,
      reorderLevel: 30,
      condition: 'NEW',
      isConsumable: true,
      depreciationRate: 0,
      assignedDepartmentId: deptAcademics?.id,
    },
    {
      assetCode: 'INV-UNI-401',
      barcode: '890123456004',
      qrCode: 'QR-INV-UNI-401',
      name: 'Senior School Navy Woolen Blazers (Size 36)',
      categoryCode: 'CAT-UNI',
      vendorCode: 'VND-UNI-02',
      location: 'Central Uniform Counter',
      unit: 'PIECES',
      purchaseCost: 1250,
      unitPrice: 1500,
      currentQuantity: 8,
      minStockThreshold: 15, // LOW STOCK TRIGGER!
      maxStockThreshold: 80,
      reorderLevel: 20,
      condition: 'NEW',
      isConsumable: true,
      depreciationRate: 0,
      assignedDepartmentId: deptAdmin?.id,
    },
    {
      assetCode: 'AST-FUR-501',
      barcode: '890123456005',
      qrCode: 'QR-AST-FUR-501',
      name: 'Godrej Heavy-Duty Ergonomic Dual Student Desks',
      categoryCode: 'CAT-FUR',
      vendorCode: 'VND-FUR-05',
      location: 'Wing C Classrooms (Grades 9-12)',
      unit: 'SETS',
      purchaseCost: 4800,
      unitPrice: 4800,
      currentQuantity: 120,
      minStockThreshold: 10,
      maxStockThreshold: 150,
      reorderLevel: 15,
      condition: 'EXCELLENT',
      isConsumable: false,
      warrantyExpiry: new Date('2031-03-31'),
      depreciationRate: 10.0,
      assignedDepartmentId: deptAdmin?.id,
    },
    {
      assetCode: 'INV-STA-601',
      barcode: '890123456006',
      qrCode: 'QR-INV-STA-601',
      name: 'A4 75 GSM High-Speed Copier Paper Reams (500 Sheets)',
      categoryCode: 'CAT-STA',
      vendorCode: 'VND-BOK-01',
      location: 'Central Examination & Printing Depot',
      unit: 'REAMS',
      purchaseCost: 260,
      unitPrice: 290,
      currentQuantity: 4,
      minStockThreshold: 20, // CRITICAL LOW STOCK!
      maxStockThreshold: 150,
      reorderLevel: 25,
      condition: 'NEW',
      isConsumable: true,
      assignedDepartmentId: deptAdmin?.id,
    },
  ];

  const itemMap = new Map<string, any>();
  for (const it of itemsData) {
    const catId = catMap.get(it.categoryCode);
    const vId = vendorMap.get(it.vendorCode);
    if (!catId) continue;

    const record = await prisma.assetItem.upsert({
      where: { assetCode: it.assetCode },
      update: {
        barcode: it.barcode,
        qrCode: it.qrCode,
        name: it.name,
        categoryId: catId,
        vendorId: vId,
        location: it.location,
        unit: it.unit,
        purchaseCost: it.purchaseCost,
        unitPrice: it.unitPrice,
        currentQuantity: it.currentQuantity,
        minStockThreshold: it.minStockThreshold,
        maxStockThreshold: it.maxStockThreshold,
        reorderLevel: it.reorderLevel,
        condition: it.condition,
        isConsumable: it.isConsumable,
        serialNumber: it.serialNumber,
        warrantyExpiry: it.warrantyExpiry,
        amcDetails: it.amcDetails,
        depreciationRate: it.depreciationRate,
        assignedDepartmentId: it.assignedDepartmentId,
      },
      create: {
        assetCode: it.assetCode,
        barcode: it.barcode,
        qrCode: it.qrCode,
        name: it.name,
        categoryId: catId,
        vendorId: vId,
        location: it.location,
        unit: it.unit,
        purchaseCost: it.purchaseCost,
        unitPrice: it.unitPrice,
        currentQuantity: it.currentQuantity,
        minStockThreshold: it.minStockThreshold,
        maxStockThreshold: it.maxStockThreshold,
        reorderLevel: it.reorderLevel,
        condition: it.condition,
        isConsumable: it.isConsumable,
        serialNumber: it.serialNumber,
        warrantyExpiry: it.warrantyExpiry,
        amcDetails: it.amcDetails,
        depreciationRate: it.depreciationRate,
        assignedDepartmentId: it.assignedDepartmentId,
      },
    });
    itemMap.set(it.assetCode, record);
  }
  console.log(`Upserted ${itemMap.size} Item Master Records`);

  // 4. Stock Movements
  const hpDesk = itemMap.get('AST-CMP-101');
  const paper = itemMap.get('INV-STA-601');
  if (hpDesk && admin) {
    await prisma.stockMovement.create({
      data: {
        assetItemId: hpDesk.id,
        movementType: 'STOCK_IN',
        quantity: 10,
        previousQuantity: 25,
        newQuantity: 35,
        fromLocation: 'Apex Infotech Dispatch',
        toLocation: hpDesk.location,
        referenceNumber: 'GRN-2026-0041',
        unitCost: 52000,
        totalCost: 520000,
        reason: 'Expansion of Senior Coding Lab',
        recordedBy: admin.firstName + ' ' + (admin.lastName || ''),
      }
    });
  }

  if (paper && admin) {
    await prisma.stockMovement.create({
      data: {
        assetItemId: paper.id,
        movementType: 'ISSUE',
        quantity: 16,
        previousQuantity: 20,
        newQuantity: 4,
        fromLocation: paper.location,
        toLocation: 'CBSE Term Examination Control Room',
        referenceNumber: 'ISS-2026-0089',
        unitCost: 260,
        totalCost: 4160,
        reason: 'Term 2 examination question & answer printing',
        recordedBy: admin.firstName + ' ' + (admin.lastName || ''),
      }
    });
  }
  console.log('Seeded Stock Movements');

  // 5. Purchase Requests
  if (admin && teacher) {
    const pr1 = await prisma.purchaseRequest.upsert({
      where: { id: 'PR-TEST-001' },
      update: {},
      create: {
        id: 'PR-TEST-001',
        itemTitle: 'Digital Smartboard 75-inch 4K Interactive Panels',
        categoryName: 'Computers & IT Hardware',
        departmentName: 'Academics & Faculty',
        priority: 'HIGH',
        quantity: 3,
        estimatedCost: 285000,
        reason: 'Modernization of Classrooms 10-A, 10-B, and 12-Science with interactive touch displays',
        status: 'DEPARTMENT_APPROVED',
        requestedByUserId: teacher.id,
        quotationRef: 'APX-QT-8910',
        quotationVendor: 'Apex Infotech Solutions',
        quotationAmount: 279000,
        endorsementNotes: 'Endorsed by HOD Science. Essential for NEP 2020 digital pedagogical integration.',
      }
    });

    const pr2 = await prisma.purchaseRequest.upsert({
      where: { id: 'PR-TEST-002' },
      update: {},
      create: {
        id: 'PR-TEST-002',
        itemTitle: 'A4 Copier Paper Reams (Emergency Buffer)',
        categoryName: 'Stationery Supplies',
        departmentName: 'School Administration',
        priority: 'URGENT',
        quantity: 50,
        estimatedCost: 13000,
        reason: 'Current stock depleted to 4 reams. Immediate replenishment required for school exams.',
        status: 'APPROVED',
        requestedByUserId: admin.id,
        approvedByUserId: admin.id,
        quotationRef: 'OXF-QT-3321',
        quotationVendor: 'Oxford Educational Books & Publishers',
        quotationAmount: 12500,
        endorsementNotes: 'Approved for urgent issuance of purchase order.',
      }
    });
    console.log('Seeded Purchase Requests');

    // 6. Purchase Order & GRN
    const apexVendor = vendorMap.get('VND-CMP-03');
    if (apexVendor) {
      const po = await prisma.purchaseOrder.upsert({
        where: { poNumber: 'PO-2026-0041' },
        update: {},
        create: {
          poNumber: 'PO-2026-0041',
          vendorId: apexVendor,
          orderDate: new Date('2026-11-05'),
          expectedDeliveryDate: new Date('2026-11-20'),
          status: 'ISSUED',
          subtotal: 520000,
          taxAmount: 93600,
          totalAmount: 613600,
          paymentTerms: '50% Advance, 50% on Delivery & GRN Inspection',
          notes: 'Deliver to Block B Computer Lab with warranty stickers affixed.',
          createdByName: 'Rajesh Sharma (Admin)',
          items: {
            create: [
              {
                itemTitle: 'HP ProDesk 400 G7 Core i5 Desktops',
                quantity: 10,
                receivedQuantity: 10,
                unitPrice: 52000,
                totalPrice: 520000,
                assetItemId: hpDesk?.id,
              }
            ]
          },
          grns: {
            create: [
              {
                grnNumber: 'GRN-2026-0041',
                receivedDate: new Date('2026-11-12'),
                receivedByName: 'Vikram Verma (IT Coordinator)',
                invoiceNumber: 'INV-APX-8812',
                invoiceDate: new Date('2026-11-12'),
                invoiceAmount: 613600,
                paymentStatus: 'PAID',
                paymentMode: 'NEFT / RTGS',
                transactionRef: 'HDFC-RTGS-990182',
                remarks: 'All 10 desktop units inspected, BIOS tested, and asset tags AST-CMP-101 affixed.',
              }
            ]
          }
        }
      });
      console.log('Seeded Purchase Order with GRN & Invoice');
    }
  }

  // 7. Asset Maintenance Log
  if (hpDesk) {
    await prisma.assetMaintenanceLog.create({
      data: {
        assetItemId: hpDesk.id,
        maintenanceType: 'PREVENTIVE',
        serviceDate: new Date('2026-10-15'),
        serviceProvider: 'Apex Infotech Service Team',
        technicianName: 'Sanjay Rawat',
        technicianContact: '+91 98111 22334',
        description: 'Quarterly hardware health check, thermal paste replacement, and Windows security patch updates.',
        cost: 3500,
        status: 'COMPLETED',
        nextServiceDate: new Date('2027-01-15'),
        recordedByName: 'IT Store Admin',
      }
    });
  }

  // 8. Stock Audit Session
  const auditSession = await prisma.stockAuditSession.upsert({
    where: { auditCode: 'AUD-2026-Q3' },
    update: {},
    create: {
      auditCode: 'AUD-2026-Q3',
      auditDate: new Date(),
      auditorName: 'Senior Internal Audit Committee',
      departmentName: 'Central Examination Depot & IT Stores',
      status: 'RECONCILED',
      remarks: 'Quarterly physical stock verification completed. Reconciled paper reams discrepancy.',
      items: {
        create: [
          {
            assetItemId: hpDesk?.id || '',
            systemQuantity: 35,
            physicalQuantity: 35,
            discrepancy: 0,
            unitCost: 52000,
            discrepancyValue: 0,
            reason: '100% physically accounted for in Lab 1',
            reconciled: true,
          },
          {
            assetItemId: paper?.id || '',
            systemQuantity: 6,
            physicalQuantity: 4,
            discrepancy: -2,
            unitCost: 260,
            discrepancyValue: -520,
            reason: '2 damaged reams during transit water leakage, adjusted in damage ledger',
            reconciled: true,
          }
        ]
      }
    }
  });
  console.log('Seeded Stock Audit Session:', auditSession.auditCode);

  console.log('--- Inventory, Procurement & Asset Data Seed Complete! ---');
}

seedInventory()
  .catch((err) => {
    console.error('Seed Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
