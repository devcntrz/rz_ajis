/** types/user.ts — matches real ajis_user table */
export interface AjisUser {
  id_user:              number;
  username:             string;
  password:             string;
  id_kantor:            string;
  nama_kantor:          string;
  nama_wilayah:         string;
  aktif:                'y' | 'n';
  id_group_user:        number;
  id_wilayah_pembinaan: string;
}
