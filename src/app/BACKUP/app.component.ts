import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ChatService, User, MSG } from './chat.service';

import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './components/dialog.component';

const mediaContrains = {
    audio: true,
    video: {width:480, height: 360}
};

const offerOptions = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
};

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [ChatService]
})

export class AppComponent {    
    msgArray: Array<MSG> = [];    
    userArray: Array<User> = [];
    socket_id: string = "";
    userName: string = "";
    roomName: string = "";
    isJoinValid: boolean = false;
    isEnableInput: boolean = true;
    talkto: string="All";
    inputMSG: string= "";
    isOnStream: boolean = false;
    isShowAccept: boolean = false;

    @ViewChild('local_video') localVideo!: ElementRef<HTMLVideoElement>;
    @ViewChild('remote_video') remoteVideo!: ElementRef<HTMLVideoElement>;
    private localStream!: MediaStream;
    peer : any;
    //private peerConnection!: RTCPeerConnection;

    constructor(private _chatService: ChatService,
                private dialog: MatDialog) {    }
    
    ngOnInit(): void {
        this._chatService.getUserID().subscribe(data => this.socket_id = data);
        this._chatService.userConnected().subscribe(data => this.userArray = data);
        this._chatService.msgRecived().subscribe(data => {
            let msg:MSG = {from:data.from, to:data.to, msg:data.msg, index:this.msgArray.length}                        
            this.msgArray.push(msg)});
        this._chatService.listenCallFromRemote().subscribe( data => {
            this.isShowAccept = data;
            this.isOnStream = data;
        });
        /*
        this._chatService.userLeaved().subscribe(userID => {
            let index = this.userArray.findIndex(ele => ele.ID === userID);
            if (index !== -1) console.log("REMOVE", this.userArray.splice(index, 1)[0]);
            else console.log("USER NOT FOUND TO DELETE");            
        });*/
    }

    userNameOnKey(event: any) {
        this.userName = event.target.value;
        this.checkJoinVaid();
    }
    userNameBlur(event: any) {
        this.userName = event.target.value;
        this.checkJoinVaid();
    }
    roomNameOnKey(event: any) {
        this.roomName = event.target.value;
        this.checkJoinVaid();
    }
    roomNameBlur(event: any) {
        this.roomName = event.target.value;
        this.checkJoinVaid();
    }
    checkJoinVaid() {
        let result = true;
        if (this.userName === "") result = false;
        if (this.roomName === "") result = false;
        if (result) this.isJoinValid = true;
        else this.isJoinValid = false;
    }

    connetChatRoom() {    
        if(this.isEnableInput){
            console.log(this.userName," JOIN " ,this.roomName);
            this._chatService.joinChatRoom(this.userName, this.roomName)
            .subscribe(result => {
                if(result) this.isEnableInput = false;
                else {
                    let dialogRef = this.dialog.open(DialogComponent,{data:"姓名重複"});}
            });      
        } else { 
            this.isEnableInput = true;
            this._chatService.leaveChatRoom(this.userName, this.roomName);            
        }
    }
    getRoomList(): Array<string> {
        let roomList:Array<string> = [];
        this.userArray.forEach(user => {
            if (user.room =="") return;
            if (user.room ==undefined) return;
            if(roomList.length==0) { roomList.push(user.room); }
            else {
                let index =  roomList.find(ele => ele==user.room);
                if(index == undefined) roomList.push(user.room); 
            }    
        });        
        return roomList;
    }
    getNumOfUser() {
        if (this.isEnableInput) return null;
        let userCount = 0;
        this.userArray.forEach(user => {
            if(user.room === this.roomName) userCount +=1;
        });
        return userCount;
    }
    sendMSG() {
        if(this.inputMSG === "") return;
        if(this.isEnableInput) return;

        let msg = {from:this.userName, to:this.talkto, msg:this.inputMSG, index:-1}
        this._chatService.sendMSG(this.roomName,msg);
        this.inputMSG = "";
     }
     msgInputKeyup(event:any){
         if (event.key !== "Enter") return;
         if(this.inputMSG === "") return;
         if(this.isEnableInput) return;
         
        let msg = {from:this.userName, to:this.talkto, msg:this.inputMSG, index:-1}
        this._chatService.sendMSG(this.roomName,msg);
        this.inputMSG = "";
     }
     sortData(){
         let newArr = this.msgArray.sort((a,b) => b.index - a.index);
         return newArr;
     }
     getID(who: string): string {         
         let user = this.userArray.find(user => user.name === who);
         if(user) return user.ID;
         else return "";
     }
     answerCall() {
        this.isShowAccept = !this.isShowAccept;
        this.requestMediaDevices();
        this._chatService.anwserCall(this.remoteVideo, this.localStream);

     }
     callUser() {
        this.isOnStream = true;
        this.requestMediaDevices();
        let idToCall = this.getID(this.talkto);
        console.log("idToCall",idToCall);
        if(idToCall === '') {
            let dialogRef = this.dialog.open(DialogComponent,{data:"請選擇視訊成員"});
            return ;
        }
        this._chatService.callUser(this.remoteVideo, this.localStream, idToCall);        
     }
     
    private async requestMediaDevices(): Promise<void> {
        this.localStream = await navigator.mediaDevices.getUserMedia(mediaContrains);
        this.localVideo.nativeElement.srcObject = this.localStream;
        
    }
     startPlayLocal() {
        this.localVideo.nativeElement.srcObject = this.localStream;
     }
     stopPlayLocal() {
        this.localVideo.nativeElement.srcObject = null;
     }
     startPlayRemote() {}
     stopPlayRemote() {}
     test(){

        this.isOnStream = !this.isOnStream;
         //this.requestMediaDevices();
         //this.remoteVideo.nativeElement.srcObject = this.localStream;
         //this._chatService.test(this.remoteVideo,this.localStream,{from:this.socket_id, to:this.talkto});       
     }
     test2() {
        this.requestMediaDevices();
         //console.log("this.isOnStream",this.isOnStream);
         //console.log("this.isOnStream",this.isOnStream);
        //this._chatService.test2(this.remoteVideo, this.localStream,{from:this.socket_id, to:this.talkto});       
     }
}

