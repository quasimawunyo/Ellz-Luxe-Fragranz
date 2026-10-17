export function ThemeScript() {
  const source = `(function(){try{if(localStorage.getItem("elf-theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}})()`;
  return <script dangerouslySetInnerHTML={{ __html: source }} />;
}
