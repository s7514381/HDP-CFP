/**
 * 帳號資料型別
 */
type User = {
    id: number,
    username: string,
    auth_key: string,
    email: string,
    status: number,
    created_at: number,
    updated_at: number,
    member_name?: string,
    member_ename?: string,
    member_abb_name: string,
    contact_account: string,
    contact_phone: string,
    tel_1: string,
    tel_1_ext?: string,
    tel_2?: string,
    tel_2_ext?: string,
    fax?: string,
    department: string,
    title: string,
    company_tax_id: string,
    bill_account?: string,
    address: string,
    bill_address?: string,
    member_type?: string,
    member_class: string,
    member_state: number,
    member_mail_validate: number,
    fg: number,
}

/**
 * 帳號隸屬公司資料型別
 */
type Company = {
    id: number,
    status: number,
    tax_id: string,
    hospital_code?: string,
    member_type: number,
    name: string,
    email?: string,
    en_name?: string,
    abb_name?: string,
    address: string,
    contact_person: string,
    tel: string,
    fax?: string,
    bill_contact: string,
    bill_address: string,
    created_by: number,
    updated_by: number,
    created_at: number,
    updated_at: number,
    activeAuthProducts: Product[]
}
