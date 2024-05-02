import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Room from "./Room";


export default function Landing() {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack | null>(null)
  const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null)
  
  const cam = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
    const videoStream = stream.getVideoTracks()[0];
    const audioStream = stream.getAudioTracks()[0];
    setLocalVideoTrack(videoStream);
    setLocalAudioTrack(audioStream);
    if(videoRef.current){
      videoRef.current.srcObject = new MediaStream([videoStream]);
    }
  }
  useEffect(()=>{
    if(videoRef && videoRef.current){
      cam();
    }
  },[videoRef])
  if(!joined){
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900">Welcome to the WebRTC Omegle app</h1>
        {/* video */}
        <video 
        className="border-2 border-springgreen"
        autoPlay ref={videoRef}
        height={400}
        width={400}
        ></video>
        <form className="mt-8 space-y-6" action="#" method="POST">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input id="name" name="name" 
              onChange={(e)=>setName(e.target.value)}
              style={{padding: "1rem", margin: "1rem", width: "20rem", border: "springgreen", borderRadius: "0.5rem"}}
              type="text" autoComplete="name" required className="p-4 m-4 appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:z-10 sm:text-sm" placeholder="Name" />
            </div>
          </div>

          <div>
            <button onClick={()=>setJoined(true)}
            style={{padding: "1rem", margin: "1rem", width: "22rem", border: "springgreen", borderRadius: "0.5rem"}}
            className="p-4 m-4 w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-springgreen hover:bg-springgreen-light md:py-2 md:text-lg md:px-10">
              Start
            </button>
          </div>
        </form>
      </div>
    )
  }
  else{
    return (
      <Room name={name} localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack} />
    )
  }
}
