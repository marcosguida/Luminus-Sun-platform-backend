import { uuid, z } from 'zod';

export const zodId = z.string().describe("ID do documento");

export const zodIdParams = z.object({
    params: z.object({
        id: zodId,
    })
});

export const zodCreatedAt = z.string().datetime().optional();
export const zodUpdatedAt = z.string().datetime().nullable().optional();

export const zodTimestamps = z.object({
    createdAt: zodCreatedAt,
    updatedAt: zodUpdatedAt,
});

export const createZodObjectFilter = <T extends string>(filterColumns: readonly T[]) => {
    const filterShape = filterColumns.reduce((acc, column) => {
        acc[column] = z.string().optional();
        return acc;
    }, {} as Record<T, z.ZodOptional<z.ZodString>>);

    const filterObject = z.object(filterShape).strict();

    return {
        query: z.object({
            filter: filterObject.optional(),
        })
    };
};

export type ZodObjectFilter<T extends string> = z.infer<
    ReturnType<typeof createZodObjectFilter<T>>["query"]
>;

export const createZodPagination = <T extends string>(sortableColumns: readonly T[]) => ({
    query: z.object({
        offset: z.coerce.number().min(0).default(0),
        limit: z.coerce.number().min(1).default(10),
        sort: z.enum(["asc", "desc"]).default("asc"),
        orderBy: z.enum(sortableColumns).default(sortableColumns[0]),
    })
});

export type ZodPagination<T extends string> = z.infer<
    ReturnType<typeof createZodPagination<T>>["query"]
>;

export const createZodPaginationFilter = <TFilter extends string, TSort extends string>({ filterColumns, sortableColumns }: { filterColumns: readonly TFilter[], sortableColumns: readonly TSort[] }) => {
    const paginationSchema = createZodPagination(sortableColumns);
    const filterSchema = createZodObjectFilter(filterColumns);

    return z.object({
        query: z.object({
            ...paginationSchema.query.shape,
            ...filterSchema.query.shape,
        })
    });
};

export type ZodPaginationFilter<TFilter extends string, TSort extends string> = z.infer<
    ReturnType<typeof createZodPaginationFilter<TFilter, TSort>>['shape']['query']
>;

export const zodPaginationResult = z.object({
    data: z.array(z.any()),
    total: z.number().min(0),
    limit: z.number().min(1),
    offset: z.number().min(0),
    sort: z.enum(["asc", "desc"]),
    orderBy: z.string(),
});

export type ZodPaginationResult<T> = z.infer<typeof zodPaginationResult> & { data: T[] };
