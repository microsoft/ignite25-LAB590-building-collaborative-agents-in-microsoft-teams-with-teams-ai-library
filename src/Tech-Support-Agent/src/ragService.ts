import { LaptopOption } from './interfaces';

interface LaptopKnowledgeBase {
    id: string;
    brand: 'Dell' | 'HP' | 'Lenovo' | 'Apple' | 'Microsoft' | 'ASUS' | 'Acer' | 'MSI';
    model: string;
    processor: string;
    ram: string;
    storage: string;
    price: number;
    category: 'Basic' | 'Standard' | 'Premium' | 'Developer';
    description: string;
    specifications: string;
    availability: boolean;
    useCase: string[];
    pros: string[];
    targetAudience: string;
    performanceScore: number;
}

/**
 * RAG Service for dynamic laptop retrieval and recommendations
 */
export class LaptopRAGService {
    private knowledgeBase: LaptopKnowledgeBase[] = [
        {
            id: "dell-latitude-3420",
            brand: "Dell",
            model: "Latitude 3420",
            processor: "Intel Core i5-1135G7",
            ram: "8GB DDR4",
            storage: "256GB SSD",
            price: 899,
            category: "Basic",
            description: "Reliable business laptop for everyday office tasks and productivity work.",
            specifications: "14-inch FHD display, Intel Iris Xe Graphics, Windows 11 Pro, 6-cell battery",
            availability: true,
            useCase: ["office work", "email", "web browsing", "document editing", "basic business applications"],
            pros: ["Affordable", "Reliable build quality", "Good battery life", "Corporate security features"],
            targetAudience: "Office workers, administrative staff, budget-conscious users",
            performanceScore: 6
        },
        {
            id: "hp-elitebook-840",
            brand: "HP",
            model: "EliteBook 840 G8",
            processor: "Intel Core i7-1165G7",
            ram: "16GB DDR4",
            storage: "512GB SSD",
            price: 1299,
            category: "Standard",
            description: "Professional business laptop with enhanced performance for demanding applications.",
            specifications: "14-inch FHD display, Intel Iris Xe Graphics, Windows 11 Pro, Bang & Olufsen audio",
            availability: true,
            useCase: ["business analysis", "data processing", "presentations", "moderate development", "multitasking"],
            pros: ["Excellent build quality", "Great keyboard", "Strong performance", "Professional design"],
            targetAudience: "Business analysts, project managers, consultants, mid-level professionals",
            performanceScore: 8
        },
        {
            id: "lenovo-thinkpad-x1",
            brand: "Lenovo",
            model: "ThinkPad X1 Carbon",
            processor: "Intel Core i7-1260P",
            ram: "16GB LPDDR5",
            storage: "1TB SSD",
            price: 1899,
            category: "Premium",
            description: "Ultra-premium business laptop with exceptional build quality and performance.",
            specifications: "14-inch 4K HDR display, Intel Iris Xe Graphics, Windows 11 Pro, Carbon fiber construction",
            availability: true,
            useCase: ["executive work", "high-performance computing", "content creation", "advanced business applications"],
            pros: ["Premium build quality", "Excellent keyboard", "Ultra-portable", "Long battery life"],
            targetAudience: "Executives, senior professionals, frequent travelers, power users",
            performanceScore: 9
        },
        {
            id: "apple-macbook-pro-14",
            brand: "Apple",
            model: "MacBook Pro 14\"",
            processor: "Apple M2 Pro",
            ram: "16GB Unified Memory",
            storage: "512GB SSD",
            price: 2499,
            category: "Developer",
            description: "High-performance laptop designed for developers, content creators, and power users.",
            specifications: "14-inch Liquid Retina XDR display, Apple M2 Pro chip, macOS Ventura, ProRes support",
            availability: true,
            useCase: ["software development", "mobile app development", "video editing", "machine learning", "creative work"],
            pros: ["Exceptional performance", "Amazing display", "Long battery life", "Silent operation"],
            targetAudience: "Software developers, content creators, designers, iOS developers",
            performanceScore: 10
        },
        {
            id: "microsoft-surface-laptop-5",
            brand: "Microsoft",
            model: "Surface Laptop 5",
            processor: "Intel Core i7-1255U",
            ram: "16GB LPDDR5x",
            storage: "512GB SSD",
            price: 1699,
            category: "Premium",
            description: "Sleek and portable laptop perfect for modern business professionals.",
            specifications: "13.5-inch PixelSense touchscreen, Intel Iris Xe Graphics, Windows 11, Alcantara fabric",
            availability: true,
            useCase: ["business presentations", "touch-based applications", "Microsoft ecosystem", "design work"],
            pros: ["Beautiful design", "Touchscreen", "Great for Microsoft ecosystem", "Lightweight"],
            targetAudience: "Business professionals, Microsoft ecosystem users, designers, presenters",
            performanceScore: 7
        }
    ];

    /**
     * Search laptops based on natural language query using semantic matching
     */
    async searchLaptops(query: string, limit: number = 5): Promise<LaptopKnowledgeBase[]> {
        if (!query || typeof query !== 'string') {
            return this.knowledgeBase.slice(0, limit);
        }
        
        const queryLower = query.toLowerCase();
        const keywords = queryLower.split(' ').filter(word => word.length > 2);
        
        // Score each laptop based on keyword matches
        const scoredLaptops = this.knowledgeBase.map(laptop => {
            let score = 0;
            const searchableText = `
                ${laptop.brand} ${laptop.model} ${laptop.description} ${laptop.useCase.join(' ')} 
                ${laptop.category} ${laptop.targetAudience} ${laptop.pros.join(' ')} ${laptop.specifications}
            `.toLowerCase();

            // Score based on keyword matches
            keywords.forEach(keyword => {
                if (searchableText.includes(keyword)) {
                    score += 1;
                }
                
                // Boost score for exact matches in important fields
                if (laptop.brand.toLowerCase().includes(keyword)) score += 3;
                if (laptop.model.toLowerCase().includes(keyword)) score += 3;
                if (laptop.category.toLowerCase().includes(keyword)) score += 2;
                if (laptop.useCase.some(use => use.includes(keyword))) score += 2;
            });

            return { laptop, score };
        });

        // Sort by score and return top results
        return scoredLaptops
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.laptop);
    }

    /**
     * Get laptop recommendations based on specific requirements
     */
    async getLaptopRecommendations(requirements: {
        useCase?: string;
        budget?: number;
        category?: string;
        performanceNeeds?: 'low' | 'medium' | 'high';
    }): Promise<LaptopKnowledgeBase[]> {
        let candidates = [...this.knowledgeBase];

        // Filter by budget
        if (requirements.budget) {
            candidates = candidates.filter(laptop => laptop.price <= requirements.budget!);
        }

        // Filter by category
        if (requirements.category && typeof requirements.category === 'string') {
            candidates = candidates.filter(laptop => 
                laptop.category.toLowerCase() === requirements.category!.toLowerCase()
            );
        }

        // Filter by performance needs
        if (requirements.performanceNeeds) {
            const minScore = requirements.performanceNeeds === 'high' ? 8 : 
                           requirements.performanceNeeds === 'medium' ? 6 : 0;
            candidates = candidates.filter(laptop => laptop.performanceScore >= minScore);
        }

        // Score by use case
        if (requirements.useCase && typeof requirements.useCase === 'string') {
            const scored = candidates.map(laptop => {
                let score = 0;
                const useCaseText = laptop.useCase.join(' ').toLowerCase();
                
                if (useCaseText.includes(requirements.useCase!.toLowerCase())) {
                    score += 5;
                }
                
                return { laptop, score };
            });
            
            return scored
                .sort((a, b) => b.score - a.score)
                .map(item => item.laptop);
        }

        return candidates.sort((a, b) => b.performanceScore - a.performanceScore);
    }

    /**
     * Convert knowledge base laptops to LaptopOption format for compatibility
     */
    public convertToLaptopOptions(laptops: LaptopKnowledgeBase[]): LaptopOption[] {
        return laptops.map(laptop => ({
            brand: [{ name: laptop.brand as 'Dell' | 'HP' | 'Lenovo' | 'Apple' | 'Microsoft' | 'ASUS' | 'Acer' | 'MSI' }],
            model: laptop.model,
            processor: laptop.processor,
            ram: laptop.ram,
            storage: laptop.storage,
            price: laptop.price,
            category: laptop.category,
            description: laptop.description
        }));
    }

    /**
     * Get all available laptops in LaptopOption format
     */
    async getAllLaptopOptions(): Promise<LaptopOption[]> {
        return this.convertToLaptopOptions(this.knowledgeBase);
    }

    /**
     * Get laptop options based on search query
     */
    async getLaptopOptions(query?: string): Promise<LaptopOption[]> {
        if (query) {
            const searchResults = await this.searchLaptops(query);
            return this.convertToLaptopOptions(searchResults);
        }
        return this.getAllLaptopOptions();
    }

    /**
     * Generate a comprehensive laptop recommendation report
     */
    async generateRecommendationReport(requirements: {
        useCase?: string;
        budget?: number;
        category?: string;
        performanceNeeds?: 'low' | 'medium' | 'high';
    }): Promise<string> {
        const recommendations = await this.getLaptopRecommendations(requirements);
        
        if (recommendations.length === 0) {
            return "No laptops found matching your criteria. Please consider adjusting your requirements.";
        }

        let report = `## 💻 Laptop Recommendations\n\n`;
        
        recommendations.slice(0, 3).forEach((laptop, index) => {
            report += `### ${index + 1}. ${laptop.brand} ${laptop.model} - $${laptop.price.toLocaleString()}\n`;
            report += `**Category:** ${laptop.category} | **Performance:** ${laptop.performanceScore}/10\n\n`;
            report += `**Description:** ${laptop.description}\n\n`;
            report += `**Best For:** ${laptop.targetAudience}\n\n`;
            report += `**Key Features:** ${laptop.pros.slice(0, 3).join(', ')}\n\n`;
            report += `**Specifications:** ${laptop.specifications}\n\n`;
            report += `---\n\n`;
        });

        return report;
    }
}

// Export a singleton instance
export const laptopRAGService = new LaptopRAGService();