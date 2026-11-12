import Image from 'next/image'
import Link from 'next/link'
import { getProducts } from '@/lib/actions/product-actions'
import { getCategoryOptions } from '@/lib/actions/category-actions'
import { Plus, Search, Edit, ImageOff, Download } from 'lucide-react'
import DeleteProductButton from '@/components/admin/product/DeleteProductButton'

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; page?: string; category?: string }>
}) {
    const { q = '', page = '1', category = '' } = await searchParams
    const query = q || ''
    const selectedCategory = category || ''
    const currentPage = Number(page) || 1
    const limit = 10

    const [{ data: products, count, error }, categoryOptions] = await Promise.all([
        getProducts(query, currentPage, limit, selectedCategory),
        getCategoryOptions(),
    ])
    const totalPages = count
        ? Math.max(1, Math.ceil(count / limit))
        : Math.max(1, currentPage + (products && products.length === limit ? 1 : 0))

    const parentCategories = categoryOptions.filter((c) => !c.parent_id)
    const buildPageHref = (targetPage: number) => {
        const params = new URLSearchParams()
        params.set('page', String(targetPage))
        if (query) params.set('q', query)
        if (selectedCategory) params.set('category', selectedCategory)
        return `/admin/products?${params.toString()}`
    }

    const hasPrev = currentPage > 1
    const hasNext = count
        ? currentPage < totalPages
        : Boolean(products && products.length === limit)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                <div className="flex gap-2">
                    <a
                        href="/api/admin/exports/products"
                        className="flex items-center px-3 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                        <Download className="w-4 h-4 mr-2" /> Export CSV
                    </a>
                    <Link
                        href="/admin/products/new"
                        className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Product
                    </Link>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <form action="/admin/products" method="GET" className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[220px] max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            name="q"
                            defaultValue={query}
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                    </div>
                    <select
                        name="category"
                        defaultValue={selectedCategory}
                        aria-label="Filter by category"
                        className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    >
                        <option value="">All Categories</option>
                        {parentCategories.map((parent) => {
                            const children = categoryOptions.filter((c) => c.parent_id === parent.id)
                            return (
                                <optgroup key={parent.id} label={parent.name}>
                                    <option value={parent.id}>{parent.name} (All)</option>
                                    {children.map((child) => (
                                        <option key={child.id} value={child.id}>
                                            &nbsp;&nbsp;↳ {child.name}
                                        </option>
                                    ))}
                                </optgroup>
                            )
                        })}
                        <option value="uncategorized">Uncategorized</option>
                    </select>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors"
                    >
                        Apply
                    </button>
                    {(query || selectedCategory) && (
                        <Link
                            href="/admin/products"
                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Clear
                        </Link>
                    )}
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    {error && (
                        <div className="px-6 py-4 text-sm text-red-700 bg-red-50 border-b border-red-100">
                            {error}
                        </div>
                    )}
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                {/* Type and Vendor removed per request */}
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {(products ?? []).map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="relative flex-shrink-0 h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 overflow-hidden">
                                                {product.product_media?.[0]?.media_url ? (
                                                    <Image
                                                        src={product.product_media[0].media_url}
                                                        alt={product.title}
                                                        fill
                                                        className="object-cover"
                                                        sizes="48px"
                                                    />
                                                ) : (
                                                    <ImageOff className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-900">{product.title}</span>
                                                    {product.is_free_delivery && (
                                                        <span className="px-2 py-0.5 inline-flex text-[11px] leading-4 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                                                            Free Delivery
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">{product.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {product.categories?.name ? (
                                            <span className="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                                {product.categories.name}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">Uncategorized</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'active' ? 'bg-green-100 text-green-800' :
                                            product.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Link href={`/admin/products/${product.id}`} className="text-gray-500 hover:text-gray-900 p-1 hover:bg-gray-100 rounded">
                                                <Edit className="w-5 h-5" />
                                            </Link>
                                            <DeleteProductButton id={product.id} title={product.title} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products?.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No products found. Start by adding one!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex space-x-2">
                        {/* Prev */}
                        <Link
                            href={hasPrev ? buildPageHref(currentPage - 1) : '#'}
                            className={`px-3 py-1 border border-gray-300 rounded-md text-sm font-medium transition ${hasPrev
                                ? 'text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900'
                                : 'text-gray-400 bg-gray-50 cursor-not-allowed'
                                }`}
                            aria-disabled={!hasPrev}
                        >
                            Previous
                        </Link>
                        {/* Next */}
                        <Link
                            href={hasNext ? buildPageHref(currentPage + 1) : '#'}
                            className={`px-3 py-1 border border-gray-300 rounded-md text-sm font-medium transition ${hasNext
                                ? 'text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900'
                                : 'text-gray-400 bg-gray-50 cursor-not-allowed'
                                }`}
                            aria-disabled={!hasNext}
                        >
                            Next
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
