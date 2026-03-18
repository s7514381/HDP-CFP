/**
 * 產品明細
 */
type ProductDetail = {
    AuthProductRd: string,
    ServiceProductRd: string,
    UnexpiredOrderNumber?: string,
    OrderNumberActive: string,
    Status: string,
    CrHmpy: string,
    CompanyTaxId: string,
    CreatedAt: number,
    UpdatedAt: number
}

/**
 * 產品型別(基本費、進階費用)
 */
type Product = {
    Rd: string
    Status: string
    ServiceProductRd: string
    PayCycleRd: string
    CompanyTaxId: string
    BeginTime: number,
    EndTime: number,
    OfferTime: number,
    CreatedAt: number,
    UpdatedAt: number,
    activeAuthDtls: ProductDetail[]
}

