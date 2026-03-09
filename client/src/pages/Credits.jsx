import React, { useEffect, useState } from 'react'
import { dummyPlans } from '../assets/assets'
import Loading from './loading'

const Credits = () => {
  const [Plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  
  const fetchPlans = async() => {
    setPlans(dummyPlans)
    setLoading(false)
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  if(loading) return <Loading/>

  return (
    <div className='max-w-7xl h-screen overflow-y-scroll mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      <h2 className='text-4xl font-semibold text-center mb-12 text-gray-900 dark:text-white'>
        Credit Plans
      </h2>

      <div className='flex flex-wrap justify-center gap-6 max-w-4xl mx-auto'>
        {Plans.map((plan) => (
          <div 
            key={plan._id} 
            className={`rounded-xl shadow-sm hover:shadow-md transition-shadow p-8 min-w-[280px] flex-1 max-w-[320px] flex flex-col ${
              plan._id === 'pro' || plan.name === 'Pro'
                ? 'bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700'
                : 'bg-white dark:bg-gray-800'
            }`}
          >
            <h3 className='text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3'>
              {plan.name}
            </h3>

            <div className='flex items-baseline gap-1 mb-6'>
              <span className='text-4xl font-bold text-purple-600 dark:text-purple-400'>
                ${plan.price}
              </span>
              <span className='text-gray-500 dark:text-gray-400 text-sm'>
                / {plan.credits} credits
              </span>
            </div>

            <ul className='list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1 flex-grow'>
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>

            <button className='mt-6 w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-medium py-2.5 rounded-full transition-colors cursor-pointer whitespace-nowrap'>
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Credits