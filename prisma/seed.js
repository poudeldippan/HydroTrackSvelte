import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({
    url: 'file:./dev.db'
});
const prisma = new PrismaClient({ adapter });

async function main() {
    // 1. Seed Admin User
    const hashedPassword = await bcrypt.hash('password', 10);
    const user = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            name: 'HydroTrack Admin',
            email: 'admin@example.com',
            password: hashedPassword,
        }
    });
    console.log('Seed: Created admin user', user.email);

    // 2. Seed Default Project (Marsyangdi)
    const project = await prisma.project.create({
        data: {
            name: 'Marsyangdi Khola Hydroelectric Project',
            river: 'Marsyangdi',
            district: 'Lamjung',
            province: 'Gandaki',
            capacityMw: 12.5,
            projectType: 'run_of_river',
            status: 'construction',
            totalProjectCost: 2200000000.0,
            description: 'Run-of-river project in Gandaki province tracking milestones.',
            ppaSignedDate: new Date('2023-12-10'),
            financialClosureDate: new Date('2023-11-02'),
            constructionStartDate: new Date('2024-02-01'),
            targetCodDate: new Date('2026-12-15'),
        }
    });
    console.log('Seed: Created project', project.name);

    // 3. Seed Construction Components
    const components = [
        { name: 'Civil Headworks & Intake', code: 'C-01', category: 'civil_headworks', plannedStart: new Date('2024-02-01'), plannedEnd: new Date('2025-06-30'), plannedCost: 450000000.0, weightPct: 20.0, actualProgress: 35.0, scheduleStatus: 'on_track' },
        { name: 'Headrace Tunnel & Shaft', code: 'C-02', category: 'headrace', plannedStart: new Date('2024-03-15'), plannedEnd: new Date('2025-12-31'), plannedCost: 650000000.0, weightPct: 30.0, actualProgress: 25.0, scheduleStatus: 'slight_delay' },
        { name: 'Powerhouse & Tailrace', code: 'C-03', category: 'powerhouse_civil', plannedStart: new Date('2024-05-01'), plannedEnd: new Date('2026-03-31'), plannedCost: 350000000.0, weightPct: 15.0, actualProgress: 15.0, scheduleStatus: 'on_track' },
        { name: 'Electromechanical Equipment', code: 'EM-01', category: 'electromechanical', plannedStart: new Date('2025-01-01'), plannedEnd: new Date('2026-08-31'), plannedCost: 400000000.0, weightPct: 18.0, actualProgress: 5.0, scheduleStatus: 'on_track' },
        { name: 'Transmission Line (132kV)', code: 'TL-01', category: 'transmission', plannedStart: new Date('2025-06-01'), plannedEnd: new Date('2026-10-31'), plannedCost: 150000000.0, weightPct: 7.0, actualProgress: 0.0, scheduleStatus: 'on_track' },
        { name: 'Access Road & Infrastructure', code: 'AR-01', category: 'access_road', plannedStart: new Date('2024-02-01'), plannedEnd: new Date('2024-10-31'), plannedCost: 100000000.0, weightPct: 5.0, actualProgress: 85.0, scheduleStatus: 'on_track' },
        { name: 'Camp Facilities & Social', code: 'CF-01', category: 'camp_facilities', plannedStart: new Date('2024-02-01'), plannedEnd: new Date('2024-08-31'), plannedCost: 100000000.0, weightPct: 5.0, actualProgress: 95.0, scheduleStatus: 'on_track' },
    ];

    for (const c of components) {
        await prisma.constructionComponent.create({
            data: { ...c, projectId: project.id }
        });
    }
    console.log('Seed: Created WBS components');

    // 4. Seed Contractors
    const contractor = await prisma.contractor.create({
        data: {
            projectId: project.id,
            companyName: 'Chitwan Civil Constructors Ltd',
            contactPerson: 'Madan Krishna Shrestha',
            contactPhone: '9845011223',
            contactEmail: 'contact@chitwancivil.com.np',
            contractNumber: 'HP-CIVIL-002',
            contractType: 'epc',
            workScope: 'Headworks excavation, headrace tunnel blasting, concrete pouring',
            contractValue: 1250000000.00,
            contractStart: new Date('2024-02-01'),
            contractEnd: new Date('2026-06-30'),
            retentionPct: 5.0,
            mobilizationAdvance: 125000000.00,
            mobilizationRecovered: 25000000.00,
            performanceStatus: 'on_track',
        }
    });

    await prisma.contractorBill.create({
        data: {
            contractorId: contractor.id,
            billNumber: 'CC-RA-001',
            billDate: new Date('2024-04-15'),
            submissionDate: new Date('2024-04-20'),
            billAmount: 45000000.00,
            certifiedAmount: 42000000.00,
            certifiedDate: new Date('2024-04-25'),
            certifiedBy: 'Manoj Gyawali (Owner Engineer)',
            retentionDeducted: 2100000.00,
            advanceRecovered: 4200000.00,
            netPayable: 3570000.00,
            paidAmount: 3570000.00,
            paidDate: new Date('2024-04-28'),
            status: 'paid'
        }
    });
    console.log('Seed: Created contractor & bills');

    // 5. Seed Land Parcels
    const landParcels = [
        { plotNumber: '101', vdcMunicipality: 'Bharatpur', wardNumber: '4', ownerName: 'Ram Bahadur Gurung', ownerContact: '9845012345', areaRopani: 1.5, areaSqm: 1.5 * 508.72, landType: 'agricultural', acquisitionStatus: 'land_registered', agreedCompensation: 1500000.0, paidCompensation: 1500000.0, isDisputed: false, latitude: 28.2234, longitude: 84.3456 },
        { plotNumber: '102', vdcMunicipality: 'Bharatpur', wardNumber: '4', ownerName: 'Hari Maya Shrestha', ownerContact: '9808123456', areaRopani: 2.2, areaSqm: 2.2 * 508.72, landType: 'agricultural', acquisitionStatus: 'compensation_paid', agreedCompensation: 2200000.0, paidCompensation: 2200000.0, isDisputed: false, latitude: 28.2245, longitude: 84.3467 },
        { plotNumber: '103', vdcMunicipality: 'Bharatpur', wardNumber: '5', ownerName: 'Sita Devi Adhikari', ownerContact: '9856034512', areaRopani: 0.85, areaSqm: 0.85 * 508.72, landType: 'residential', acquisitionStatus: 'agreement_signed', agreedCompensation: 3400000.0, paidCompensation: 1000000.0, isDisputed: false, latitude: 28.2256, longitude: 84.3478 },
        { plotNumber: '104', vdcMunicipality: 'Ratnanagar', wardNumber: '2', ownerName: 'Krishna Prasad Sapkota', ownerContact: '9841234567', areaRopani: 3.1, areaSqm: 3.1 * 508.72, landType: 'agricultural', acquisitionStatus: 'in_negotiation', agreedCompensation: 2800000.0, paidCompensation: 0.0, isDisputed: false, latitude: 28.2267, longitude: 84.3489 },
        { plotNumber: '105', vdcMunicipality: 'Ratnanagar', wardNumber: '2', ownerName: 'Gopal Prasad Pokharel', ownerContact: '9803456789', areaRopani: 1.75, areaSqm: 1.75 * 508.72, landType: 'agricultural', acquisitionStatus: 'disputed', agreedCompensation: 1900000.0, paidCompensation: 0.0, isDisputed: true, disputeReason: 'Boundary overlap dispute with forest boundary', disputeStatus: 'Legal proceedings active', latitude: 28.2278, longitude: 84.3499 },
        { plotNumber: '106', vdcMunicipality: 'Khairahani', wardNumber: '6', ownerName: 'Maya Devi Tamang', ownerContact: '9812345678', areaRopani: 4.5, areaSqm: 4.5 * 508.72, landType: 'forest', acquisitionStatus: 'not_initiated', agreedCompensation: 2500000.0, paidCompensation: 0.0, isDisputed: false, latitude: 28.2289, longitude: 84.3510 },
    ];

    for (const p of landParcels) {
        await prisma.landParcel.create({
            data: { ...p, projectId: project.id }
        });
    }
    console.log('Seed: Created land parcels');

    // 6. Seed Clearances
    const clearances = [
        {
            name: 'Survey License',
            type: 'survey_license',
            status: 'approved',
            issuingAgency: 'Department of Electricity Development (DoED)',
            applicationDate: new Date('2022-01-10'),
            approvalDate: new Date('2022-04-15'),
            validityYears: 5,
            expiryDate: new Date('2027-04-15'),
            responsiblePerson: 'Ram Bahadur KC',
            notes: 'Approved without issues.'
        },
        {
            name: 'Generation License',
            type: 'generation_license',
            status: 'submitted',
            issuingAgency: 'Ministry of Energy, Water Resources and Irrigation',
            applicationDate: new Date('2023-06-12'),
            expectedDate: new Date('2024-08-30'),
            responsiblePerson: 'Sita Devi Adhikari',
            notes: 'Documents submitted, currently under administrative review.'
        },
        {
            name: 'EIA Approval',
            type: 'eia_approval',
            status: 'approved',
            issuingAgency: 'Ministry of Forests and Environment',
            applicationDate: new Date('2022-08-20'),
            approvalDate: new Date('2023-03-05'),
            validityYears: 10,
            expiryDate: new Date('2033-03-05'),
            responsiblePerson: 'Krishna Prasad Sapkota',
            notes: 'EIA completed and approved.'
        }
    ];

    for (const c of clearances) {
        await prisma.clearance.create({
            data: { ...c, projectId: project.id }
        });
    }
    console.log('Seed: Created clearances');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
