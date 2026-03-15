import { assets } from "../assets/assets";

const Brand = ({ theme = "light", size = "md", centered = false, className = "" }) => {
  const iconClass =
    size === "sm" ? "w-8 h-8" : size === "lg" ? "w-14 h-14" : "w-10 h-10";
  const titleClass =
    size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl";
  const subtitleClass =
    size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";

  return (
    <div
      className={`flex items-center gap-3 ${
        centered ? "justify-center" : ""
      } ${className}`}
    >
      <img src={assets.logo} alt="QuickGPT" className={`${iconClass} flex-shrink-0`} />
      <div className="leading-tight">
        <div className={`${titleClass} font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>
          QuickGPT
        </div>
        <div className={`${subtitleClass} font-medium text-purple-600`}>
          Intelligent AI Assistant
        </div>
      </div>
    </div>
  );
};

export default Brand;

