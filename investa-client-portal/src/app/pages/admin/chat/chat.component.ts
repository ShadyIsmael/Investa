import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormControl } from '@angular/forms';

import { TranslatePipe } from '../../../pipes/translate.pipe';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { firstValueFrom } from 'rxjs';

import { API_BASE } from '../../../config/api.token';



interface Contact {

  id: string;

  name: string;

  avatarUrl: string;

  lastMessage: string;

  timestamp: string;

  online: boolean;

  otherUserId?: string;

}



interface MessageFile {

  name: string;

  size: number;

  type: string;

}



interface Message {

  id: string;

  senderId: string;

  text?: string;

  file?: MessageFile;

  timestamp: string;

  isSender: boolean;

}



@Component({

  standalone: true,

  selector: 'app-chat',

  templateUrl: './chat.component.html',

  styleUrls: ['./chat.component.scss'],

  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [CommonModule, ReactiveFormsModule, TranslatePipe]

})

export class ChatComponent implements OnInit {

  private http = inject(HttpClient);

  private apiBase = inject(API_BASE);



  contacts = signal<Contact[]>([]);

  messages = signal<Message[]>([]);

  loading = signal(true);

  

  selectedContact = signal<Contact | null>(null);

  attachedFile = signal<File | null>(null);

  

  messageControl = new FormControl('');



  conversation = computed(() => {

    const contact = this.selectedContact();

    if (!contact) {

      return [];

    }

    return this.messages().filter(m => m.senderId !== 'system'); // Filter system messages

  });



  async ngOnInit() {

    await this.loadConversations();

  }



  private async loadConversations() {

    try {

      this.loading.set(true);

      const response = await firstValueFrom(this.http.get<any>(`${this.apiBase}/api/conversations`, this.getHttpOptions()));

      

      const contacts: Contact[] = response.map((conv: any) => ({

        id: conv.id,

        name: conv.otherUserName || conv.title || 'Unknown',

        avatarUrl: 'https://picsum.photos/seed/person1/100/100',

        lastMessage: 'Start a conversation',

        timestamp: new Date(conv.createdAt).toLocaleDateString(),

        online: false,

        otherUserId: conv.otherUserId

      }));



      this.contacts.set(contacts);

      

      if (contacts.length > 0) {

        this.selectContact(contacts[0]);

      }

    } catch (error) {

      console.error('Failed to load conversations:', error);

    } finally {

      this.loading.set(false);

    }

  }



  private async loadMessages(conversationId: string) {

    try {

      const response = await firstValueFrom(this.http.get<any>(`${this.apiBase}/api/conversations/${conversationId}/messages`, this.getHttpOptions()));

      

      const userId = localStorage.getItem('userId');

      const messages: Message[] = response.map((msg: any) => ({

        id: msg.id,

        senderId: msg.senderId,

        text: msg.text,

        timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

        isSender: msg.senderId === userId

      }));



      this.messages.set(messages);

    } catch (error) {

      console.error('Failed to load messages:', error);

    }

  }



  selectContact(contact: Contact) {

    this.selectedContact.set(contact);

    this.loadMessages(contact.id);

  }



  async sendMessage() {

    const text = this.messageControl.value?.trim();

    const file = this.attachedFile();

    const contact = this.selectedContact();



    if ((!text && !file) || !contact) {

        return;

    }



    try {

      const response = await firstValueFrom(this.http.post<any>(

        `${this.apiBase}/api/conversations/${contact.id}/messages`,

        { text: text || '' },

        this.getHttpOptions()

      ));



      const userId = localStorage.getItem('userId');

      const newMessage: Message = {

        id: response.id,

        senderId: response.senderId,

        text: response.text,

        timestamp: new Date(response.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

        isSender: response.senderId === userId

      };



      this.messages.update(msgs => [...msgs, newMessage]);

      this.messageControl.setValue('');

      this.attachedFile.set(null);

    } catch (error) {

      console.error('Failed to send message:', error);

    }

  }



  onFileSelected(event: Event) {

    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {

        this.attachedFile.set(input.files[0]);

        input.value = ''; // Allow selecting the same file again

    }

  }



  removeAttachment() {

    this.attachedFile.set(null);

  }



  startVideoCall() {

    // TODO: Implement video call functionality

  }



  startAudioCall() {

    // TODO: Implement audio call functionality

  }



  formatFileSize(bytes: number): string {

    if (bytes === 0) return '0 Bytes';

    const k = 1024;

    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];

  }



  private getHttpOptions() {

    const token = localStorage.getItem('accessToken');

    return {

      headers: new HttpHeaders({

        'Content-Type': 'application/json',

        ...(token ? { Authorization: `Bearer ${token}` } : {})

      })

    };

  }

}