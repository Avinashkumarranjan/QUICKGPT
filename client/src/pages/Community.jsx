import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import Loading from './loading'
import toast from 'react-hot-toast'

const normalizeImageUrl = (value) => {
  if (!value) return value
  if (value.startsWith('data:')) return value
  if (/^https?:\/\//i.test(value)) return value
  return `https://${value.replace(/^\/\//, '')}`
}

const Community = () => {
  const { axios } = useAppContext()
  const [Images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
 

  useEffect(() => {
    const fetchPublishedImages = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get('/api/user/published-images')

        if (!data?.success) {
          setImages([])
          return toast.error(data?.message || 'Failed to load community images')
        }

        const normalized = (data.images || [])
          .map((item) => ({
            imageUrl: item?.imageUrl || item?.content || item?.url,
            userName: item?.userName || item?.name || 'Unknown',
          }))
          .filter((item) => Boolean(item.imageUrl))

        setImages(normalized)
      } catch (error) {
        setImages([])
        toast.error(error?.response?.data?.message || error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPublishedImages()
  }, [axios])

  if(loading) return <Loading/>

  return (
    <div className='p-6 pt-12 xl:px-12 2xl:px-20 w-full mx-auto h-full overflow-y-scroll'>
      <h2 className='text-xl font-semibold mb-6 text-gray-800 dark:text-purple-100'>
        Community Images
      </h2>

      {Images.length > 0 ? (
        <div className='flex flex-wrap max-sm:justify-center gap-5'>
          {Images.map((item, index) => (
            <a 
              key={index} 
              href={normalizeImageUrl(item.imageUrl)} 
              target="_blank" 
              rel="noopener noreferrer"
              className='relative group block rounded-lg overflow-hidden border border-gray-200 dark:border-purple-700 shadow-sm hover:shadow-md transition-shadow duration-300'
            >
              <img 
                src={normalizeImageUrl(item.imageUrl)} 
                alt={`Created by ${item.userName}`}
                onError={(e) => {
                  if (e.currentTarget.src !== assets.mountain_img) {
                    e.currentTarget.src = assets.mountain_img
                  }
                }}
                className='w-full h-60 md:h-60 2xl:h-64 object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out' 
              />
              <p className='absolute bottom-0 right-0 text-xs bg-black/50 backdrop-blur text-white px-4 py-1 rounded-tl-xl opacity-0 group-hover:opacity-100 transition duration-300'>
                Created by {item.userName}
              </p>
            </a>
          ))}
        </div>
      ) : (
        <p className='text-center text-gray-600 dark:text-purple-200 mt-10'>
          No images Available.
        </p>
      )}
    </div>
  )
}

export default Community
