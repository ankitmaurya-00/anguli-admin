import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import VillageCard from '../components/VillageCard';

const VillageDirectory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [villages, setVillages] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const stateFilter = searchParams.get('state') || '';
  const districtFilter = searchParams.get('district') || '';

  useEffect(() => {
    api.get('/states').then((res) => setStates(res.data.states)).catch(() => {});
  }, []);

  useEffect(() => {
    if (stateFilter) {
      api.get(`/states/${stateFilter}/districts`).then((res) => setDistricts(res.data.districts)).catch(() => {});
    } else {
      setDistricts([]);
    }
  }, [stateFilter]);

  useEffect(() => {
    setLoading(true);
    const params = { page };
    if (stateFilter) params.state = stateFilter;
    if (districtFilter) params.district = districtFilter;

    api
      .get('/villages', { params })
      .then((res) => {
        setVillages(res.data.villages);
        setPages(res.data.pages);
      })
      .finally(() => setLoading(false));
  }, [stateFilter, districtFilter, page]);

  const updateFilter = (key, value) => {
    const params = Object.fromEntries(searchParams);
    if (value) params[key] = value;
    else delete params[key];
    if (key === 'state') delete params.district;
    setSearchParams(params);
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Village Directory</h1>
      <p className="text-gray-500 mb-6">Apne state aur district ke hisaab se gaon dhoondhein</p>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={stateFilter}
          onChange={(e) => updateFilter('state', e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary-500"
        >
          <option value="">Sabhi States</option>
          {states.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
        <select
          value={districtFilter}
          onChange={(e) => updateFilter('district', e.target.value)}
          disabled={!stateFilter}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary-500 disabled:bg-gray-50"
        >
          <option value="">Sabhi Districts</option>
          {districts.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-56 animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : villages.length === 0 ? (
        <p className="text-gray-500 text-center py-16">Koi village nahi mila. Filters change karke dekhein.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {villages.map((v) => (
              <VillageCard key={v._id} village={v} />
            ))}
          </div>

          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-full text-sm font-medium ${
                    page === i + 1 ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VillageDirectory;
