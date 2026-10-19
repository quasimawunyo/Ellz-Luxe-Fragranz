export function InstallCapture({ nonce }: { nonce?: string }) {
  const source = `(function(){window.__elfInstallHook=true;window.addEventListener("beforeinstallprompt",function(event){event.preventDefault();window.__elfInstallPrompt=event;window.dispatchEvent(new Event("elf-install-ready"));});})()`;
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: source }} />;
}
