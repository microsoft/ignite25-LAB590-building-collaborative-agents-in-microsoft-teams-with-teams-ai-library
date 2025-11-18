import { LaptopOption } from './interfaces';
import { laptopRAGService } from './ragService';

/**
 * Get laptop options using RAG service instead of static data
 */
export const getLaptopOptions = async (query?: string): Promise<LaptopOption[]> => {
    return await laptopRAGService.getLaptopOptions(query);
};

/**
 * Get laptop recommendations based on user requirements
 */
export const getLaptopRecommendations = async (requirements: {
    useCase?: string;
    budget?: number;
    category?: string;
    performanceNeeds?: 'low' | 'medium' | 'high';
}): Promise<string> => {
    return await laptopRAGService.generateRecommendationReport(requirements);
};

/**
 * Search laptops by query
 */
export const searchLaptops = async (query: string): Promise<LaptopOption[]> => {
    const results = await laptopRAGService.searchLaptops(query);
    return laptopRAGService.convertToLaptopOptions(results);
};