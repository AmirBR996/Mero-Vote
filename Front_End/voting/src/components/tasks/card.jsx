import { BsFillPinAngleFill } from "react-icons/bs";
import { FaTrash } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
const Card = ({ task }) => {
  return (
    <div className="border border-gray-300 py-3 px-4 rounded-md shadow  flex flex-col gap-2">
      <div className="flex justify-between">
        <p className="text-lg font-bold text-gray-800">Task</p>
        {/* pin */}
        <BsFillPinAngleFill size={22} className="text-gray-600" />
      </div>
      {/* priority */}
      <div>
        <p
          className={`${task.priority === "medium" ? "bg-yellow-500" : task.priority === "low" ? "bg-red-500" : "bg-green-500"} w-25 rounded-md text-center text-white font-bold text-sm py-0.5`}
        >
          {task.priority}
        </p>
      </div>
      <div className="flex flex-col gap-1">
        {/* title */}
        <p className="text-[18px] font-semibold text-gray-700 line-clamp-1">
          {task.title}
        </p>
        {/* content */}
        <p className="text-[14px] text-gray-600">{task.text}</p>
        {/* buttons */}
        <div className="flex justify-end gap-2 mt-1 items-center">
          {/* edit */}
          <FaEdit
            title="Edit Task"
            size={20}
            className="text-blue-600 cursor-pointer"
          />
          {/* delete */}
          <FaTrash
            title="Delete Task"
            size={16}
            className="text-red-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default Card;


//git username : saagar7200
//  9865374070 : whatsapp
// rsaagar7200@gail.com