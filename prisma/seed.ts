import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

const providers = [
  { username: 'issam_agadir', phone: '06 77 04 22 41' },
  { username: 'hicham_marrakech', phone: '06 64 04 00 91' },
  { username: 'adil_rabat', phone: '06 45 26 18 22' },
  { username: 'adil_tanger', phone: '06 88 29 14 71' },
  { username: 'adil_fes', phone: '06 06 00 48 17' },
  { username: 'zouhair_kenitra', phone: '07 07 34 50 38' },
  { username: 'interface_casa', phone: null },
];

type Store = { banner: string; storeName: string; city: string; provider: string; supervisor?: string; phone?: string; pdf?: string; deadline?: string };
const stores: Store[] = [
  {banner:'Carrefour',storeName:'Hyper Agadir',city:'Agadir',provider:'issam_agadir',supervisor:'Ahmed Kakkas',phone:'06 77 04 22 41',pdf:'https://drive.google.com/file/d/17_VCB6fdTe2tfnd8JIjTl_KAFIA9PSKW/view?usp=sharing',deadline:'2026-12-11'},
  {banner:'Carrefour Market',storeName:'Agadir Talborjt',city:'Agadir',provider:'issam_agadir',supervisor:'Ahmed Kakkas',phone:'06 77 04 22 41',pdf:'https://drive.google.com/file/d/1B9gMIreoyWLhGubyOBsf72Lz6uzVgm6x/view?usp=drive_link',deadline:'2026-12-11'},
  {banner:'Marjane',storeName:'Agadir Founty',city:'Agadir',provider:'issam_agadir',supervisor:'Ahmed Kakkas',phone:'06 77 04 22 41',pdf:'https://drive.google.com/file/d/17yhrp80DKT-uRP8a-Am2fhEvp-T2aIDo/view?usp=drive_link',deadline:'2026-10-23'},
  {banner:'Carrefour',storeName:'Hyper Marrakech Targa',city:'Marrakech',provider:'hicham_marrakech',supervisor:'Ahmed Kakkas',phone:'06 64 04 00 91',pdf:'https://drive.google.com/file/d/1epGtENBIoiDnfbMXfPGSZVjQVhj8y5aI/view?usp=drive_link',deadline:'2026-12-11'},
  {banner:'Carrefour',storeName:'Hyper Marrakech Al Mazar',city:'Marrakech',provider:'hicham_marrakech',supervisor:'Ahmed Kakkas',phone:'06 64 04 00 91',pdf:'https://drive.google.com/file/d/1HjtJfgCmgpQr9fsyBOdSG6g6ASXxkzvo/view?usp=drive_link',deadline:'2026-12-11'},
  {banner:'Marjane',storeName:'Marrakech Menara',city:'Marrakech',provider:'hicham_marrakech',supervisor:'Ahmed Kakkas',phone:'06 64 04 00 91',pdf:'https://drive.google.com/file/d/18WJS7Y6J4FS7qV9JFMQApmOWEBYbxtqV/view?usp=drive_link',deadline:'2026-10-23'},
  {banner:'Carrefour',storeName:'Hyper Témara',city:'Témara',provider:'adil_rabat',supervisor:'Youness Krimat',phone:'06 45 26 18 22',pdf:'https://drive.google.com/file/d/1CXFgkEwLdcTeeDWAWmh4fzPeFgNS_sok/view?usp=drive_link',deadline:'2026-12-11'},
  {banner:'Carrefour',storeName:'Hyper Salé',city:'Salé',provider:'adil_rabat',supervisor:'Youness Krimat',phone:'06 45 26 18 22',pdf:'https://drive.google.com/file/d/1TesiglFwUMP65WnTgxysBPWKGCD_7lnI/view?usp=drive_link',deadline:'2026-12-11'},
  {banner:'Carrefour Market',storeName:'Témara Al Wifak',city:'Témara',provider:'adil_rabat',supervisor:'Youness Krimat',phone:'06 45 26 18 22',pdf:'https://drive.google.com/file/d/1mEThiaJZ9Hb6P6PXv6I3OFYi1M-kxQtB/view?usp=drive_link',deadline:'2026-12-11'},
  {banner:'Marjane',storeName:'Hay Riad',city:'Rabat',provider:'adil_rabat',supervisor:'Youness Krimat',phone:'06 45 26 18 22',pdf:'https://drive.google.com/file/d/1aAo6lXLdWLAIUilKbQ1o8ityGSZB9W5G/view?usp=drive_link',deadline:'2026-10-23'},
  {banner:'Marjane',storeName:'Arribat Center',city:'Rabat',provider:'adil_rabat',supervisor:'Youness Krimat',phone:'06 45 26 18 22',pdf:'https://drive.google.com/file/d/1gJpFpFcel7_ICvc-7tOA9nbZuHuULRm1/view?usp=drive_link',deadline:'2026-10-23'},
  {banner:'Aswak Assalam',storeName:'Hay Riad',city:'Rabat',provider:'adil_rabat',supervisor:'Youness Krimat',phone:'06 45 26 18 22',pdf:'https://drive.google.com/file/d/1iwbjVyJv_se78SG6vgmO_2PT-XPCcsNh/view?usp=drive_link',deadline:'2026-10-23'},
  {banner:'Carrefour',storeName:'Hyper Tanger',city:'Tanger',provider:'adil_tanger',supervisor:'Adil Maimouni',phone:'06 88 29 14 71',pdf:'https://drive.google.com/file/d/1L7NwIZgjBrHeCVkk62B2XAcLQHejNOKD/view?usp=drive_link',deadline:'2026-12-11'},
  {banner:'Marjane',storeName:'Tanger',city:'Tanger',provider:'adil_tanger',supervisor:'Adil Maimouni',phone:'06 88 29 14 71',pdf:'https://drive.google.com/file/d/1HIpLSL1rlpj8230e1o6_MFG8jQve8v57/view?usp=drive_link',deadline:'2026-10-23'},
  {banner:'Marjane',storeName:'Kenitra',city:'Kénitra',provider:'zouhair_kenitra',supervisor:'Youness Krimat',phone:'07 07 34 50 38',pdf:'https://drive.google.com/file/d/1jvb5Ko5aN4k8Ohsa5TYE_O7m6GHESSjt/view?usp=drive_link',deadline:'2026-10-23'},
  {banner:'Marjane',storeName:'Fes Saiss II',city:'Fès',provider:'adil_fes',supervisor:'Yassine Abbray',phone:'06 06 00 48 17',pdf:'https://drive.google.com/file/d/1u6THhru4aj_DE2b2vtk1iNOQijUfBQMd/view?usp=drive_link',deadline:'2026-10-23'},
  {banner:'Marjane',storeName:'Meknes',city:'Meknès',provider:'adil_fes',supervisor:'Yassine Abbray',phone:'06 06 00 48 17',pdf:'https://drive.google.com/file/d/1n6s6EVL840F7WKFwXekwdsrmgUQ3zU0e/view?usp=drive_link',deadline:'2026-10-23'},
  {banner:'Carrefour',storeName:'CARREFOUR AIN SEBAA',city:'Casablanca',provider:'interface_casa',supervisor:'Abdelfettah',deadline:'2026-12-11'},
  {banner:'Carrefour',storeName:'Hyper Dar Bouazza',city:'Casablanca',provider:'interface_casa',supervisor:'Abdelfettah',pdf:'https://drive.google.com/file/d/1FX6YL4XOUWipvr1hjdeA-Bx5Dc9GrTHA/view?usp=drive_link',deadline:'2026-12-11'},
  {banner:'Carrefour',storeName:'Hyper Casa Sidi Maarouf',city:'Casablanca',provider:'interface_casa',supervisor:'Abdelfettah',pdf:'https://drive.google.com/file/d/1YB1LqRy_Abwmj2zT2WoAClluJUb6gKXI/view?usp=drive_link',deadline:'2026-12-11'},
  {banner:'Carrefour',storeName:'HLV ALMAZ',city:'Casablanca',provider:'interface_casa',supervisor:'Abdelfettah',deadline:'2026-12-11'},
  {banner:'Marjane',storeName:'Californie',city:'Casablanca',provider:'interface_casa',supervisor:'Abdelfettah',pdf:'https://drive.google.com/file/d/1OKZgtVfVHXb19anAPGMecQd_YkBVItU7/view?usp=drive_link',deadline:'2026-10-23'},
  {banner:'Marjane',storeName:'Hay Hassani',city:'Casablanca',provider:'interface_casa',supervisor:'Abdelfettah',pdf:'https://drive.google.com/file/d/1QOgJjt7MOqSt7CsNmfXOWcPGnVW6RRA0/view?usp=drive_link',deadline:'2026-10-23'},
  {banner:'Marjane',storeName:'Ain Sebaa',city:'Casablanca',provider:'interface_casa',supervisor:'Abdessamad',pdf:'https://drive.google.com/file/d/17uyJNXCpBCDxzm-ncurz-rzugKVqdG6s/view?usp=drive_link',deadline:'2026-10-23'},
  {banner:'Marjane',storeName:'Derb Sultan',city:'Casablanca',provider:'interface_casa',supervisor:'Abdessamad',pdf:'https://drive.google.com/file/d/1gK4vioQVvcjEw99dHUp2SI6GBouUa9cy/view?usp=drive_link',deadline:'2026-10-23'},
  {banner:'Carrefour',storeName:'Hyper Berrechid',city:'Berrechid',provider:'interface_casa',supervisor:'Abdessamad',pdf:'https://drive.google.com/file/d/1yPxXZYcCnEYgrvChRtMEFlKIk3L65gXM/view?usp=drive_link',deadline:'2026-12-11'},
  {banner:'Marjane',storeName:'Mohammedia',city:'Mohammedia',provider:'interface_casa',supervisor:'Abdelfettah',pdf:'https://drive.google.com/file/d/14JHk9Q7ndqGFB1WdEvNuQmamfGltAh_A/view?usp=drive_link',deadline:'2026-10-23'},
  {banner:'Aswak Assalam',storeName:'Mohammedia',city:'Mohammedia',provider:'interface_casa',supervisor:'Abdelfettah',pdf:'https://drive.google.com/file/d/1ToGIcW1QzhCFBUXikXYIQJeMrv6-aDlC/view?usp=drive_link',deadline:'2026-10-23'},
  {banner:'Carrefour Market',storeName:'El Jadida',city:'El Jadida',provider:'interface_casa',supervisor:'Abdessamad',pdf:'https://drive.google.com/file/d/1PWjF-qZKednyPQvIVoog7BKlwWS8ZJtC/view?usp=drive_link',deadline:'2026-12-11'},
  {banner:'Marjane',storeName:'El Jadida',city:'El Jadida',provider:'interface_casa',supervisor:'Abdessamad',pdf:'https://drive.google.com/file/d/1PWjF-qZKednyPQvIVoog7BKlwWS8ZJtC/view?usp=drive_link',deadline:'2026-10-23'}
];

async function main() {
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
  const providerPassword = process.env.INITIAL_PROVIDER_PASSWORD;
  if (!adminPassword || !providerPassword) throw new Error('Set INITIAL_ADMIN_PASSWORD and INITIAL_PROVIDER_PASSWORD before seeding.');
  if (adminPassword.length < 6) throw new Error('Initial admin password must be at least 6 characters.');
  if (providerPassword.length < 8) throw new Error('Initial provider password must be at least 8 characters.');
  const adminHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({ where: { username: 'admin' }, update: { role: UserRole.ADMIN, active: true }, create: { username: 'admin', passwordHash: adminHash, role: UserRole.ADMIN } });
  const providerHash = await bcrypt.hash(providerPassword, 12);
  for (const provider of providers) {
    await prisma.user.upsert({ where: { username: provider.username }, update: { phone: provider.phone, role: UserRole.PROVIDER, active: true }, create: { ...provider, passwordHash: providerHash, role: UserRole.PROVIDER } });
  }
  const users = await prisma.user.findMany({ where: { role: UserRole.PROVIDER }, select: { id: true, username: true } });
  const ids = new Map(users.map(u => [u.username, u.id]));
  for (const store of stores) {
    const { provider, deadline, pdf, ...data } = store;
    await prisma.installation.upsert({
      where: { banner_storeName_city: { banner: data.banner, storeName: data.storeName, city: data.city } },
      update: { ...data, deadline: deadline ? new Date(`${deadline}T12:00:00.000Z`) : null, techSheetUrl: pdf ?? null },
      create: { ...data, providerId: ids.get(provider) ?? null, deadline: deadline ? new Date(`${deadline}T12:00:00.000Z`) : null, techSheetUrl: pdf ?? null }
    });
  }
  console.log(`Seed completed: 1 admin, ${providers.length} providers, ${stores.length} stores.`);
}
main().finally(() => prisma.$disconnect());
