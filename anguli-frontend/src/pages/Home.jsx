import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiMapPin, FiUsers, FiArrowRight } from 'react-icons/fi';
import api from '../api/axios';
import VillageCard from '../components/VillageCard';

const Home = () => {
  const [featuredVillages, setFeaturedVillages] = useState([]);
  const [states, setStates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.get('/villages?featured=true&limit=6').then((res) => setFeaturedVillages(res.data.villages)).catch(() => {});
    api.get('/states').then((res) => setStates(res.data.states)).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Aapka Shahar, Aapki Pehchan</h1>
          <p className="text-primary-100 max-w-xl mx-auto mb-8">
            Apne gaon aur district ki directory dhoondhein, community se judein, aur apni awaz share karein.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
            }}
            className="max-w-xl mx-auto flex bg-white rounded-full shadow-lg overflow-hidden"
          >
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Apna gaon ya district search karein..."
              className="flex-1 px-5 py-3 text-gray-800 outline-none"
            />
            <button type="submit" className="bg-accent-500 hover:bg-accent-600 text-white px-6 flex items-center gap-2 font-medium">
              <FiSearch /> Search
            </button>
          </form>
        </div>
      </section>

      {/* States quick links */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">States Browse Karein</h2>
        <div className="flex flex-wrap gap-3">
          {states.map((s) => (
            <Link
              key={s._id}
              to={`/villages?state=${s._id}`}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:border-primary-400 hover:text-primary-600 px-4 py-2 rounded-full text-sm font-medium text-gray-700"
            >
              <FiMapPin size={14} /> {s.name} <span className="text-xs text-gray-400">({s.villagesCount})</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Villages */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Featured Villages</h2>
          <Link to="/villages" className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:underline">
            View All <FiArrowRight />
          </Link>
        </div>
        {featuredVillages.length === 0 ? (
          <p className="text-gray-500 text-sm">Jald hi featured villages yahan dikhengi.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredVillages.map((v) => (
              <VillageCard key={v._id} village={v} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-accent-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 text-center">
          <FiUsers size={40} className="mx-auto mb-3" />
          <h2 className="text-2xl font-bold mb-2">Apni Community Se Judein</h2>
          <p className="mb-6 text-accent-50">Posts share karein, apne gaon walon se connect karein, aur updates paayein.</p>
          <Link to="/register" className="bg-white text-accent-600 font-semibold px-6 py-3 rounded-full hover:bg-gray-100">
            Free Me Join Karein
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
