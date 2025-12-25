import Image from 'next/image';
import Link from 'next/link';
import { Category } from '@/types/category';
import { motion } from "framer-motion";

interface CategoriesProps {
  categories: Category[];
}

export function Categories({ categories }: CategoriesProps) {
  return (
    <motion.section
      className="mt-8 sm:mt-10"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="flex items-center px-4 sm:px-4 justify-between mb-6 -mx-4">
        <h2 className="font-heading text-heading-3">Categories</h2>
        <Link href="/categories" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background text-white hover:bg-[#44caad] hover:text-white h-10 px-4 py-2">
          View all
        </Link>
      </div>
      <div className="-mx-4">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex snap-x snap-mandatory pb-4 px-4 pr-8 min-w-full gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${encodeURIComponent(category.id || category.slug)}`}
                className="group relative flex-none w-[280px] aspect-square rounded-2xl overflow-hidden snap-start"
              >
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="heading-4 text-white">{category.name}</h3>
                  {/* <p className="text-white/90 text-sm">{category.carCount} vehicles</p> */}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
