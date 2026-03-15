import axios from "axios"
import Chat from "../models/Chat.js"
import User from "../models/User.js"
import imagekit from "../configs/imageKit.js"
import openai from "../configs/openai.js"
 
const ensureHttpUrl = (value) => {
    if (!value) return value;
    if (value.startsWith("data:")) return value;
    if (/^https?:\/\//i.test(value)) return value;
    return `https://${value.replace(/^\/\//, "")}`;
};

//Text-based AI Chat Message Controller
export const textMessageController = async(req,res)=>{
    try {
        const userId = req.user._id

        // check credits
        if(req.user.credits<1){
            return res.json({success: false, message:"You don't have enough credits to use this feature"})
        }
        const {chatId, prompt} = req.body
        
        const chat = await Chat.findOne({userId,_id:chatId})
        chat.messages.push({role: "user", content: prompt, timestamp: Date.now(), isImage: false})

        const {choices}= await openai.chat.completions.create({
          model: "gemini-3-flash-preview",
          messages: [
           {
            role: "user",
            content: prompt,
           },
    ],
});

const reply = {...choices[0].message,timestamp: Date.now(), isImage: false}
res.json({success:true, reply})  
chat.messages.push(reply)
await chat.save()
await User.updateOne({_id: userId}, {$inc: {credits:-1}})
} catch (error) {
     res.json({success:false, message:"Error in text_based Ai chat message controller", error:error.message})   
}
}

// Image genration message controller
export const imageMessageController = async(req,res)=>{
    try {
        const userId = req.user._id;
        // Check credits
        if(req.user.credits<2){
            return res.json({success: false, message:"You don't have enough credits to use this feature"})
        }
        const {prompt, chatId, isPublished, isPuclished} = req.body
        const publishFlag = isPublished ?? isPuclished
        // find chat
        const chat = await Chat.findOne({userId, _id: chatId})
        chat.messages.push({
            role: "user", 
            content: prompt, 
            timestamp: Date.now(), 
            isImage: false
        })

        // Encode the prompt
        const encodedPrompt = encodeURIComponent(prompt)

        // Construct ImageKit Ai genration URl
        const imagekitEndpoint = ensureHttpUrl(process.env.IMAGEKIT_URL_ENDPOINT || "").replace(/\/+$/, "");
        if (!imagekitEndpoint) {
            throw new Error("IMAGEKIT_URL_ENDPOINT is not set");
        }
        const genratedImageUrl = `${imagekitEndpoint}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;
        // Trigger genration by fetching from Imagekit
        const  aiImageResponse = await axios.get(genratedImageUrl,{responseType:"arraybuffer"})

        // Convert to base64 data URI
        const base64Image = `data:image/png;base64,${Buffer.from(
            aiImageResponse.data,
            "binary"
        ).toString("base64")}`;

        // upload to ImageKit Media Library
        const uploadResponse = await imagekit.files.upload({
            file:base64Image,
            fileName:`${Date.now()}.png`,
            folder:"quickgpt"
        })
        const reply = {
            role:"assistant",
            content: ensureHttpUrl(uploadResponse.url),
            timestamp: Date.now(), 
            isImage: true,
            isPublished: publishFlag
        }
        res.json({success:true, reply})  
        chat.messages.push(reply)
        await chat.save()

        await User.updateOne({_id: userId}, {$inc: {credits:-2}})
    } catch (error) {
        res.json({ success: false, message: error.message});
    }
}

