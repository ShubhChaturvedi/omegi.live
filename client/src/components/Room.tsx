import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";

// const URL = "https://ec2-3-25-57-1.ap-southeast-2.compute.amazonaws.com:3000/";

// const URL = "http://localhost:3000/";

const URL = "https://26d2-2401-4900-1c5e-4a8c-2b48-8486-f05a-5ecd.ngrok-free.app/";

export default function Room({
  name,
  localAudioTrack,
  localVideoTrack
}: {
  name: string;
  localAudioTrack: MediaStreamTrack;
  localVideoTrack: MediaStreamTrack;
}) {
  const [lobby, setLobby] = useState(true);
    const [socket, setSocket] = useState<null | Socket>(null);
    const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
    const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(null);
    const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>();
    const localVideoRef = useRef<HTMLVideoElement>();
    const [video , setVideo] = useState<"video off" | "video on">("video off");
    const [mute, setMute] = useState<"mute" | "unmute">("mute");

    useEffect(() => {
        const socket = io(URL);
        socket.on('send-offer', async ({roomId}) => {
            setLobby(false);
            const pc = new RTCPeerConnection();

            setSendingPc(pc);
            if (localVideoTrack) {
                pc.addTrack(localVideoTrack)
            }
            if (localAudioTrack) {
                pc.addTrack(localAudioTrack)
            }

            pc.onicecandidate = async (e) => {
                console.log("receiving ice candidate locally");
                if (e.candidate) {
                   socket.emit("add-ice-candidate", {
                    candidate: e.candidate,
                    type: "sender",
                    roomId
                   })
                }
            }

            pc.onnegotiationneeded = async () => {
                console.log("on negotiation neeeded, sending offer");
                const sdp = await pc.createOffer();
                //@ts-ignore
                pc.setLocalDescription(sdp)
                socket.emit("offer", {
                    sdp,
                    roomId
                })
            }
        });

        socket.on("offer", async ({roomId, sdp: remoteSdp}) => {
            console.log("received offer");
            setLobby(false);
            const pc = new RTCPeerConnection();
            pc.setRemoteDescription(remoteSdp)
            const sdp = await pc.createAnswer();
            //@ts-ignore
            pc.setLocalDescription(sdp)
            const stream = new MediaStream();
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }

            setRemoteMediaStream(stream);
            // trickle ice 
            setReceivingPc(pc);
            // window.pcr = pc;
            // pc.ontrack = (e) => {
            //     alert("ontrack");
                // console.error("inside ontrack");
                // const {track, type} = e;
                // if (type == 'audio') {
                //     // setRemoteAudioTrack(track);
                //     // @ts-ignore
                //     remoteVideoRef.current.srcObject.addTrack(track)
                // } else {
                //     // setRemoteVideoTrack(track);
                //     // @ts-ignore
                //     remoteVideoRef.current.srcObject.addTrack(track)
                // }
                // //@ts-ignore
                // remoteVideoRef.current.play();
            // }

            pc.onicecandidate = async (e) => {
                if (!e.candidate) {
                    return;
                }
                console.log("omn ice candidate on receiving seide");
                if (e.candidate) {
                   socket.emit("add-ice-candidate", {
                    candidate: e.candidate,
                    type: "receiver",
                    roomId
                   })
                }
            }

            socket.emit("answer", {
                roomId,
                sdp: sdp
            });
            setTimeout(() => {
                const track1 = pc.getTransceivers()[0].receiver.track
                const track2 = pc.getTransceivers()[1].receiver.track
                console.log(track1);
                if (track1.kind === "video") {
                    setRemoteAudioTrack(track2)
                    setRemoteVideoTrack(track1)
                } else {
                    setRemoteAudioTrack(track1)
                    setRemoteVideoTrack(track2)
                }
                //@ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track1)
                //@ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track2)
                //@ts-ignore
                remoteVideoRef.current.play();
                // if (type == 'audio') {
                //     // setRemoteAudioTrack(track);
                //     // @ts-ignore
                //     remoteVideoRef.current.srcObject.addTrack(track)
                // } else {
                //     // setRemoteVideoTrack(track);
                //     // @ts-ignore
                //     remoteVideoRef.current.srcObject.addTrack(track)
                // }
                // //@ts-ignore
            }, 5000)
        });

        socket.on("answer", ({roomId, sdp: remoteSdp}) => {
            setLobby(false);
            console.log(roomId);
            setSendingPc(pc => {
                pc?.setRemoteDescription(remoteSdp)
                return pc;
            });
            console.log("loop closed");
        })

        socket.on("lobby", () => {
            setLobby(true);
        })

        socket.on("add-ice-candidate", ({candidate, type}) => {
            console.log("add ice candidate from remote");
            console.log({candidate, type})
            if (type == "sender") {
                setReceivingPc(pc => {
                    if (!pc) {
                        console.error("receicng pc nout found")
                    } else {
                        console.error(pc.ontrack)
                    }
                    pc?.addIceCandidate(candidate)
                    return pc;
                });
            } else {
                setSendingPc(pc => {
                    if (!pc) {
                        console.error("sending pc nout found")
                    } else {
                        // console.error(pc.ontrack)
                    }
                    pc?.addIceCandidate(candidate)
                    return pc;
                });
            }
        })

        setSocket(socket)
    }, [name])

    useEffect(() => {
        if (localVideoRef.current) {
            if (localVideoTrack) {
                localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
                // localVideoRef.current.play();
                console.log(socket,sendingPc,receivingPc, remoteVideoTrack, remoteAudioTrack, remoteMediaStream)
            }
        }
    }, [localVideoRef, localAudioTrack, localVideoTrack])
  return (
    <>
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {lobby ? (<>
      <h2 className="text-4xl font-extrabold text-gray-900">You are in the room</h2>
      <div className="">
        <h2 className="text-2xl font-extrabold text-gray-900">
          Waiting for someone to join the room
        </h2>
        <video
        height={400}
        width={400}
        //@ts-ignore
        ref={localVideoRef}
        autoPlay></video>
      </div>
      
      </>):null}
      {!lobby ? 
      <>
      <h1 className="text-4xl font-extrabold text-gray-900">You are live</h1>
      <div className="flex flex-row">
        <video
        height={400}
        width={600}
        //@ts-ignore
        ref={localVideoRef}
        autoPlay></video>
        <video
        height={400}
        width={600}
        //@ts-ignore
        ref={remoteVideoRef}
        autoPlay></video>

      </div>
      <div className="flex flex-row container mx-auto">
        <button
        style={
          {
            margin: "1rem"
          }
        }
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 m-2 px-4 rounded"
        onClick={
          ()=>{
            localAudioTrack.enabled = !localAudioTrack.enabled;
            setMute(localAudioTrack.enabled ? "mute" : "unmute");
          }
        }
        >{mute}</button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold m-2 py-2 px-4 rounded"
        style={
          {
            margin: "1rem"
          }
        }
        onClick={
          ()=>{
            localVideoTrack.enabled = !localVideoTrack.enabled;
            setVideo(localVideoTrack.enabled ? "video off" : "video on");
          }
        }
        >{video}</button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold m-2 py-2 px-4 rounded"
        onClick={
          ()=>{
            window.location.reload();
          }
        }
        style={
          {
            margin: "1rem"
          }
        }
        >End call</button>
        </div>
        </>
      :null}
    </div>
    </>
  )
}
