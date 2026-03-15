import { useEffect } from "react";
import { assets } from '../assets/assets';
import moment from "moment";
import Markdown from "react-markdown";
import Prism from "prismjs";

const normalizeImageUrl = (value) => {
  if (!value) return value;
  if (value.startsWith("data:")) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value.replace(/^\/\//, "")}`;
};

const Message = ({message}) => {
 
  useEffect(() => {
    Prism.highlightAll();
  }, [message.content]);

  return (
    <div className="w-full">
      {message.role === "user" ? (
        <div className='flex items-start justify-end my-4 gap-2'>
          <div className='flex flex-col gap-2 p-2 px-4 bg-slate-50 dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md max-w-2xl'>
            <p className='text-sm dark:text-primary'>{message.content}</p>
            <span className='text-xs text-gray-400 dark:text-[#B1A6C0]'>
              {moment(message.timestamp).fromNow()}
            </span>
          </div>
          <img src={assets.user_icon} alt="User" className='w-8 rounded-full' />
        </div>
      ) : (
        <div className='flex flex-col gap-2 p-2 px-4 w-full max-w-2xl bg-primary/20 dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md my-4'>
          {message.isImage ? (
            message.content ? (
              <a href={normalizeImageUrl(message.content)} target="_blank" rel="noopener noreferrer">
                <img
                  src={normalizeImageUrl(message.content)}
                  alt="AI Generated"
                  onError={(e) => {
                    if (e.currentTarget.src !== assets.mountain_img) {
                      e.currentTarget.src = assets.mountain_img
                    }
                  }}
                  className='w-full max-w-md mt-2 rounded-md'
                />
              </a>
            ) : (
              <p className='text-sm dark:text-primary'>Image unavailable.</p>
            )
          ) : (
            <div className='text-sm dark:text-primary reset-tw'>
              <Markdown>{message.content}</Markdown>
            </div>
          )}
          <span className='text-xs text-gray-400 dark:text-[#B1A6C0]'>
            {moment(message.timestamp).fromNow()}
          </span>
        </div> 
      )}
    </div>
  );
}

export default Message;
