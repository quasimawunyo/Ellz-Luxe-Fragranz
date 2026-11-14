export function ThemeScript({ nonce }: { nonce?: string }) {
  const source = `(function(){try{if(localStorage.getItem("elf-theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}})()`;
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: source }} />;
}
