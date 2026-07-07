import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiUsers } from 'react-icons/fi';

const VillageCard = ({ village }) => {
  return (
    <Link
      to={`/villages/${village.slug}`}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
    >
      <div className="h-36 bg-gradient-to-br from-primary-100 to-accent-500/20 flex items-center justify-center">
        {village.coverImage ? (
          <img src={village.coverImage} alt={village.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl font-bold text-primary-600/40">{village.name?.[0]}</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">{village.name}</h3>
          {village.isFeatured && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Featured</span>}
        </div>
        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
          <FiMapPin size={13} /> {village.district?.name}, {village.state?.name}
        </p>
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><FiUsers size={12} /> {village.membersCount || 0} members</span>
          <span>{village.postsCount || 0} posts</span>
        </div>
      </div>
    </Link>
  );
};

export default VillageCard;
