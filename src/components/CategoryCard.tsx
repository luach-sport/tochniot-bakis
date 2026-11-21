import { Link } from 'react-router-dom';
import type { Category } from '../types';
import { programs } from '../data/programs';
import { CategoryIcon } from './CategoryIcon';

export function CategoryCard({ category }: { category: Category }) {
  const count = programs.filter((p) => p.categories.includes(category.id)).length;
  return (
    <Link to={`/category/${category.id}/`} className="category-card" style={{ background: category.tint }}>
      <span className="category-icon">
        <CategoryIcon icon={category.icon} size={30} strokeWidth={1.8} />
      </span>
      <span className="category-name">{category.name}</span>
      <span className="category-desc">{category.description}</span>
      <span className="category-count">{count === 1 ? 'פעילות אחת' : `${count} פעילויות`}</span>
    </Link>
  );
}
