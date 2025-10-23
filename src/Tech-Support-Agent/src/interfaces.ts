interface StorageState {
    currTicket: LaptopOrder | null;
    completedOrders: LaptopOrder[];
    showRequestCard?: boolean;
}

interface LaptopOrder {
    id?: string;
    employee?: { name: string; department: string; };
    requestType: "New Employee Setup" | "Hardware Replacement" | "Upgrade Request";
    businessJustification: string;
    availableLaptops: LaptopOption[];
    selectedLaptop: string;
    deliveryDate: string;
    status: 'pending' | 'submitted' | 'approved' | 'denied' | 'ordered';
    orderDate?: string;
    totalCost?: number;
    trackingNumber?: string;
    finalAmount?: number;
}

interface LaptopBrand {
    name: 'Dell' | 'HP' | 'Lenovo' | 'Apple' | 'Microsoft' | 'ASUS' | 'Acer' | 'MSI';
}

interface LaptopOption {
    brand: LaptopBrand[];
    model: string;
    processor: string;
    ram: string;
    storage: string;
    price: number;
    category: 'Basic' | 'Standard' | 'Premium' | 'Developer';
    description?: string;
}

export { StorageState, LaptopOrder, LaptopOption };