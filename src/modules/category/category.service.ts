import { prisma } from "../../lib/prisma";

const createCategory = async (payload: { name: string }) => {
    return await prisma.category.create({
        data: payload,
    });
};

const getAllCategories = async () => {
    return await prisma.category.findMany({
        orderBy: { createdAt: "desc" },
    });
};

const getCategoryById = async (id: string) => {
    return await prisma.category.findUniqueOrThrow({
        where: { id },
    });
};

const updateCategory = async (id: string, payload: { name?: string }) => {
    return await prisma.category.update({
        where: { id },
        data: payload,
    });
};

const deleteCategory = async (id: string) => {
    return await prisma.category.delete({
        where: { id },
    });
};

export const CategoryService = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};