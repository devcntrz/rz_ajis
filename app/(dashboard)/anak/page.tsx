import { requireSession } from '@/lib/auth';
import { AnakListClient } from './AnakListClient';

export default async function AnakListPage() {
  const session = await requireSession();

  return (
    <AnakListClient
      lockedScope={{
        idGroupUser:        session.idGroupUser,
        kantorId:           session.idKantor,
        namaKantor:         session.namaKantor,
        idWilayahPembinaan: session.idWilayahPembinaan,
        namaWilayah:        session.namaWilayah,
      }}
    />
  );
}
