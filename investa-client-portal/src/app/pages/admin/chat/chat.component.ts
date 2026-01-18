import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TranslatePipe } from '../../../pipes/translate.pipe';

interface Contact {
  id: number;
  name: string;
  avatarUrl: string;
  lastMessage: string;
  timestamp: string;
  online: boolean;
}

interface MessageFile {
  name: string;
  size: number;
  type: string;
}

interface Message {
  id: number;
  contactId: number;
  text?: string;
  file?: MessageFile;
  timestamp: string;
  isSender: boolean;
}

@Component({
  standalone: true,
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe]
})
export class ChatComponent {
  contacts = signal<Contact[]>([
    { id: 1, name: 'Sarah J.', avatarUrl: 'https://picsum.photos/seed/person1/100/100', lastMessage: 'Thanks for the tip on Quantum Leap AI!', timestamp: '10:30 AM', online: true },
    { id: 2, name: 'Michael B.', avatarUrl: 'https://picsum.photos/seed/person2/100/100', lastMessage: 'Let\'s discuss the portfolio strategy tomorrow.', timestamp: 'Yesterday', online: false },
    { id: 3, name: 'Jessica L.', avatarUrl: 'https://picsum.photos/seed/person3/100/100', lastMessage: 'The new bot is performing well.', timestamp: '9:15 AM', online: true },
    { id: 4, name: 'EcoVest', avatarUrl: 'https://picsum.photos/seed/author2/100/100', lastMessage: 'See attached report for Green Energy Bonds.', timestamp: 'Monday', online: false },
    { id: 5, name: 'Chain Analytics', avatarUrl: 'https://picsum.photos/seed/author3/100/100', lastMessage: 'DeFi ChainLink update is live.', timestamp: '11:45 AM', online: true },
  ]);

  messages = signal<Message[]>([
    { id: 1, contactId: 1, text: 'Hey, just wanted to follow up on our last conversation.', timestamp: '10:28 AM', isSender: false },
    { id: 2, contactId: 1, text: 'Absolutely. I\'ve been looking at the projections.', timestamp: '10:29 AM', isSender: true },
    { id: 3, contactId: 1, text: 'Thanks for the tip on Quantum Leap AI!', timestamp: '10:30 AM', isSender: false },
    { id: 4, contactId: 2, text: 'Let\'s discuss the portfolio strategy tomorrow.', timestamp: 'Yesterday', isSender: false },
    { id: 5, contactId: 3, text: 'How is the new automated trading bot performing?', timestamp: '9:14 AM', isSender: true },
    { id: 6, contactId: 3, text: 'The new bot is performing well.', timestamp: '9:15 AM', isSender: false },
    { id: 7, contactId: 5, text: 'DeFi ChainLink update is live.', timestamp: '11:45 AM', isSender: false },
  ]);
  
  selectedContact = signal<Contact | null>(this.contacts()[0]);
  attachedFile = signal<File | null>(null);
  
  messageControl = new FormControl('');

  conversation = computed(() => {
    const contact = this.selectedContact();
    if (!contact) {
      return [];
    }
    return this.messages().filter(m => m.contactId === contact.id);
  });

  selectContact(contact: Contact) {
    this.selectedContact.set(contact);
  }

  sendMessage() {
    const text = this.messageControl.value?.trim();
    const file = this.attachedFile();
    const contact = this.selectedContact();

    if ((!text && !file) || !contact) {
        return;
    }

    const newMessage: Message = {
        id: this.messages().length + 1,
        contactId: contact.id,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSender: true,
    };

    if (text) {
        newMessage.text = text;
    }

    if (file) {
        newMessage.file = {
            name: file.name,
            size: file.size,
            type: file.type
        };
    }

    this.messages.update(msgs => [...msgs, newMessage]);
    this.messageControl.setValue('');
    this.attachedFile.set(null);
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
    console.log(`Starting video call with ${this.selectedContact()?.name}`);
    // Placeholder for actual video call logic
  }

  startAudioCall() {
    console.log(`Starting audio call with ${this.selectedContact()?.name}`);
    // Placeholder for actual audio call logic
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}