import { InputsTypes } from "@prisma/client";
import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const protectedAuthInputsRouter = createProtectedRouter()
    .query("get", {
        input: z.object({
            componentId: z.string(),
            pageId: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { componentId, pageId } = input;

            return await ctx.prisma.input.findMany({
                where: {
                    componentId: componentId,
                },
                include: {
                    value: {
                        where: {
                            pageId: pageId,
                        },
                        select: {
                            id: true,
                        },
                    },
                },
            });
        },
    })
    .query("getById", {
        input: z.string(),
        resolve: async ({ input, ctx }) => {
            return await ctx.prisma.input.findUnique({
                where: {
                    id: input,
                },
            });
        },
    })
    .mutation("create", {
        input: z.object({
            type: z
                .enum([
                    InputsTypes.text,
                    InputsTypes.number,
                    InputsTypes.email,
                    InputsTypes.select,
                    InputsTypes.checkbox,
                    InputsTypes.radio,
                    InputsTypes.date,
                    InputsTypes.textarea,
                ])
                .optional(),
            name: z.string(),
            componentId: z.string(),
            halfRow: z.boolean(),
            required: z.boolean(),
        }),
        resolve: async ({ input, ctx }) => {
            const createdInput = await ctx.prisma.input.create({
                data: {
                    required: input.required,
                    type: input.type,
                    halfRow: input.halfRow,
                    name: input.name,
                    componentId: input.componentId,
                },
            });

            const pages = await ctx.prisma.page.findMany({
                where: {
                    components: {
                        some: {
                            id: input.componentId,
                        },
                    },
                },
            });

            return pages.forEach(async (page) => {
                await ctx.prisma.pageInputsValues.create({
                    data: {
                        inputId: createdInput.id,
                        pageId: page.id,
                        value: "",
                    },
                });
            });
        },
    })
    .mutation("update", {
        input: z.object({
            id: z.string(),
            type: z
                .enum([
                    InputsTypes.text,
                    InputsTypes.number,
                    InputsTypes.email,
                    InputsTypes.select,
                    InputsTypes.checkbox,
                    InputsTypes.radio,
                    InputsTypes.date,
                    InputsTypes.textarea,
                ])
                .optional(),
            name: z.string(),
            halfRow: z.boolean(),
            required: z.boolean(),
        }),
        resolve: async ({ input, ctx }) => {
            const { id, type, name, halfRow, required } = input;

            await ctx.prisma.input.update({
                where: {
                    id: id,
                },
                data: {
                    type: type,
                    name: name,
                    halfRow: halfRow,
                    required: required,
                },
            });
        },
    })
    .mutation("delete", {
        input: z.object({
            id: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { id } = input;

            await ctx.prisma.pageInputsValues.deleteMany({
                where: {
                    inputId: id,
                },
            });

            await ctx.prisma.input.delete({
                where: {
                    id: id,
                },
            });
        },
    })
    .query("getSelectOptions", {
        input: z.object({
            id: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { id } = input;

            if (id === "") {
                return null;
            }

            return await ctx.prisma.selectOption.findMany({
                where: {
                    inputId: id,
                },
            });
        },
    });
