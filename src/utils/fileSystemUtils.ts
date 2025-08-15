// File System Utilities for Local Backup Storage
// Note: This uses the File System Access API which requires user permission
// and is only available in modern browsers with HTTPS or localhost

export interface BackupOptions {
  type: 'quote' | 'invoice';
  fileName: string;
  pdfBlob: Blob;
}

export class FileSystemUtils {
  private static isFileSystemAccessSupported(): boolean {
    return 'showDirectoryPicker' in window;
  }

  /**
   * Request access to the Documents folder and create the Proforma directory structure
   */
  static async requestDocumentsAccess(): Promise<FileSystemDirectoryHandle | null> {
    if (!this.isFileSystemAccessSupported()) {
      console.warn('File System Access API not supported in this browser');
      return null;
    }

    try {
      // Request access to a directory (user will choose Documents folder)
      const directoryHandle = await (window as Window & {
        showDirectoryPicker: (options: {
          mode: 'readwrite';
          startIn: 'documents';
        }) => Promise<FileSystemDirectoryHandle>;
      }).showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      });
      
      return directoryHandle;
    } catch (error) {
      console.error('Failed to access directory:', error);
      return null;
    }
  }

  /**
   * Create the Proforma directory structure in the selected directory
   */
  static async createProformaStructure(rootHandle: FileSystemDirectoryHandle): Promise<{
    quotesHandle: FileSystemDirectoryHandle;
    invoicesHandle: FileSystemDirectoryHandle;
  } | null> {
    try {
      // Create or get Proforma directory
      const proformaHandle = await rootHandle.getDirectoryHandle('Proforma', {
        create: true
      });

      // Create or get Quotes subdirectory
      const quotesHandle = await proformaHandle.getDirectoryHandle('Quotes', {
        create: true
      });

      // Create or get Invoices subdirectory
      const invoicesHandle = await proformaHandle.getDirectoryHandle('Invoices', {
        create: true
      });

      return { quotesHandle, invoicesHandle };
    } catch (error) {
      console.error('Failed to create directory structure:', error);
      return null;
    }
  }

  /**
   * Save a PDF file to the appropriate backup directory
   */
  static async saveToBackup(options: BackupOptions): Promise<boolean> {
    if (!this.isFileSystemAccessSupported()) {
      // Fallback: trigger regular download
      this.fallbackDownload(options.pdfBlob, options.fileName);
      return false;
    }

    try {
      // Get stored directory handle or request new access
      let rootHandle = await this.getStoredDirectoryHandle();
      
      if (!rootHandle) {
        rootHandle = await this.requestDocumentsAccess();
        if (!rootHandle) {
          this.fallbackDownload(options.pdfBlob, options.fileName);
          return false;
        }
        await this.storeDirectoryHandle(rootHandle);
      }

      // Create directory structure
      const structure = await this.createProformaStructure(rootHandle);
      if (!structure) {
        this.fallbackDownload(options.pdfBlob, options.fileName);
        return false;
      }

      // Choose the appropriate directory
      const targetHandle = options.type === 'quote' 
        ? structure.quotesHandle 
        : structure.invoicesHandle;

      // Create the file
      const fileHandle = await targetHandle.getFileHandle(options.fileName, {
        create: true
      });

      // Write the PDF data
      const writable = await fileHandle.createWritable();
      await writable.write(options.pdfBlob);
      await writable.close();


      return true;
    } catch (error) {
      console.error('Failed to save to backup:', error);
      // Fallback to regular download
      this.fallbackDownload(options.pdfBlob, options.fileName);
      return false;
    }
  }

  /**
   * Store directory handle for future use (using IndexedDB)
   */
  private static async storeDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['directoryHandles'], 'readwrite');
      const store = transaction.objectStore('directoryHandles');
      await store.put(handle, 'documentsHandle');
    } catch (error) {
      console.error('Failed to store directory handle:', error);
    }
  }

  /**
   * Retrieve stored directory handle
   */
  private static async getStoredDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['directoryHandles'], 'readonly');
      const store = transaction.objectStore('directoryHandles');
      const handle = await store.get('documentsHandle');
      
      if (handle) {
        // Verify the handle is still valid
        await handle.queryPermission({ mode: 'readwrite' });
        return handle;
      }
    } catch (error) {
      console.error('Failed to retrieve directory handle:', error);
    }
    return null;
  }

  /**
   * Open IndexedDB for storing directory handles
   */
  private static openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ProformaBackup', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('directoryHandles')) {
          db.createObjectStore('directoryHandles');
        }
      };
    });
  }

  /**
   * Fallback download method when File System Access API is not available
   */
  private static fallbackDownload(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Generate a filename with timestamp
   */
  static generateFileName(type: 'quote' | 'invoice', number: string): string {
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const prefix = type === 'quote' ? 'Quote' : 'Invoice';
    return `${prefix}_${number}_${timestamp}.pdf`;
  }

  /**
   * Save a PDF to local backup with simplified interface
   */
  static async saveToLocalBackup(blob: Blob, fileName: string, type: 'quotes' | 'invoices'): Promise<boolean> {
    const backupType = type === 'quotes' ? 'quote' : 'invoice';
    return await this.saveToBackup({
      type: backupType,
      fileName,
      pdfBlob: blob
    });
  }

  /**
   * Check if backup functionality is available
   */
  static isBackupAvailable(): boolean {
    return this.isFileSystemAccessSupported();
  }

  /**
   * Show a one-time setup dialog for backup functionality
   */
  static async setupBackup(): Promise<boolean> {
    if (!this.isFileSystemAccessSupported()) {
      alert('Automatic backup is not supported in this browser. PDFs will be downloaded normally.');
      return false;
    }

    const userConfirmed = confirm(
      'Would you like to set up automatic backup for your quotes and invoices?\n\n' +
      'This will create a "Proforma" folder in your Documents directory and automatically save copies of all generated PDFs.\n\n' +
      'You can change this setting later in the application settings.'
    );

    if (userConfirmed) {
      const handle = await this.requestDocumentsAccess();
      if (handle) {
        await this.storeDirectoryHandle(handle);
        const structure = await this.createProformaStructure(handle);
        if (structure) {
          alert('Backup setup complete! PDFs will now be automatically saved to your Documents/Proforma folder.');
          return true;
        }
      }
      alert('Backup setup failed. PDFs will be downloaded normally.');
    }
    
    return false;
  }
}