const links = [
  { href: '#introduction', label: 'Introduction' },
  { href: '#zine', label: 'Read the zine' },
  { href: '#artist', label: 'About' },
]

export default function Navbar() {
  return (
    <header className="navbar">
      <a className="navbar-brand" href="#top">Negative Realm</a>
      <nav aria-label="Main">
        <ul>
          {links.map((l) => (
            <li key={l.href}><a href={l.href}>{l.label}</a></li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
