import { ElementRef, Injectable } from "@angular/core";
import io from "socket.io-client";
//import ss from 'socket.io-stream';
import { Observable } from "rxjs";
import * as SimplePeer from 'simple-peer';


export interface User {
    ID:string,
    name:string,
    room:string
}
export interface MSG {
    from: string,
    to: string,
    msg: string,
    index: number,
}

@Injectable()
export class ChatService {    

    //private io_config = {'path':'/socket'};
    private socket = io();
   // private stream=ss.createStream();
    //private peer = new SimplePeer();

    private from:string="";
    private idCallFrom:string="";
    private remoteStream: any;
    private peer: any;
    private isAnserCall = false;

    constructor() {
        this.socket.on('callUser', (data) =>{
            this.idCallFrom = data.from;
            this.remoteStream = data.signal; 
        });



        /*
        this.socket.on("socket id",(data) => {
            console.log("ID",data);
            this.socket_id = data;
        });*/

    }
    listenDestroyPeer() {
        let observable = new Observable<boolean>(observer =>{
            this.socket.on("destroy peer", () =>{
                setTimeout( this.peer.destroy(),5000);                
                console.log("destroy peer");
                observer.next(true);
            });
        });        
        return observable;
    }
    listenCallFromRemote() {
        let observable = new Observable<boolean>(observer =>{
            this.socket.on('listen',data => observer.next(true));            
        });
        return observable;
    }
    getUserID() {
        let observable = new Observable<string>(observer =>{
            this.socket.on("socket id", (data) =>{
                observer.next(data);
                observer.complete();
            });
        });
        return observable;
    }
    userConnected() {
        let observable = new Observable<User[]>(observer =>{
            this.socket.on("user connected", (data) => {
                observer.next(data);            
                console.log("user connected")
            });            
            this.socket.on("user disconnected", (data) => {
                observer.next(data);
                console.log("user disconnected")
            });    
            this.socket.on("user join room", (data) => {
                observer.next(data);
                console.log("user join room")
            });      
            this.socket.on("user leave room", (data) => {
                observer.next(data);
                console.log("user leave room")
            });             
        });
        return observable;
    }
    msgRecived() {
        let observable = new Observable<MSG>(observer =>{
            this.socket.on("receive msg", msg => {
                observer.next(msg);                            
            });   
        });
        return observable;
    }
    joinChatRoom(name:string, room: string) {
        this.socket.emit("join room", {userName:name, room:room});
        let observable = new Observable<string>(observer =>{
            this.socket.on("user valid", data =>{
                observer.next(data);                                
            });
        });
        return observable;
        
    }
    leaveChatRoom(userName:string, room:string) {
        this.socket.emit("leave room", {userName:userName, room:room});
    }
    sendMSG(room:string,msg:MSG) {
        this.socket.emit("send msg",{room:room, msg:msg});
    }


    
    pullUserList(socket_id:string,callback:(data:string) => void) {    
        this.socket.emit("get user list", socket_id);
        this.socket.on("user list", data => { 
            callback(data);
        //    console.log("SEVICE",data)
          //  return JSON.stringify(data)
        });
    }
    test3(videoR: ElementRef) {
        const peer2 = new SimplePeer();
       // peer2.on('signal', data => {peer1.signal(data)});
        peer2.on('stream', stream =>{
            videoR.nativeElement.srcObject = stream;
        })
    }

    anwserCall(videoR: ElementRef<HTMLVideoElement>, localStream:MediaStream) {
        const peer_answer = new SimplePeer({
            initiator: false, trickle: false,stream: localStream
        });

        peer_answer.on("signal", (data) => {
            console.log("peer_answer.on(signal",data)
            this.socket.emit('answerCall', { signal:data, idCallFrom:this.idCallFrom});            
        });

        peer_answer.on("stream", (currentStream) => {
            console.log("peer_answer.on(stream",currentStream);
            videoR.nativeElement.srcObject = currentStream;
          });

        peer_answer.signal(this.remoteStream);

        this.peer = peer_answer;
        
    }

    callUser(videoR: ElementRef<HTMLVideoElement>, localStream:MediaStream, idToCall:string) {
        const peer_call = new SimplePeer({initiator: true,
            trickle: false,stream: localStream});
        peer_call.on("signal", data =>{
            console.log("peer_call.on signal",data)
               this.socket.emit('callUser', {idToCall:idToCall, 
                signalData:data});
            });

        peer_call.on("stream", (currentStream) => {
            console.log("peer_answer.on(stream",currentStream);
            videoR.nativeElement.srcObject = currentStream;
            });

        this.socket.on('callAccepted', (signal) => {
            console.log('callAccepted',signal)
            peer_call.signal(signal);
        });


        /*
        this.socket.emit('callUser', {idToCall:idToCall, 
            signalData:localStream});
        console.log("EMIT callUser");*/

        this.peer = peer_call;
    }
    stopPeer(talkToID:string) {
        this.socket.emit("destroy peer", talkToID);
        setTimeout( this.peer.destroy(),5000);
        console.log("this.peer.destroy()");

    }
    test2(videoL: ElementRef, localStream:MediaStream) {
        
    }
}






