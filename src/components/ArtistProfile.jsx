import { useState } from 'react'

// EDIT THIS: replace the text with your own biography.
const profile = {
  name: 'Negative Realm',
  role: 'Poet and collector of anatomical graphics',
  bio: [
    'Negative Realm writes the poems and gathers the anatomical engravings that make up “At Least Until My Body Give Up On Me”.',
    'Add your own biography here: where you work from, what you make, how to get in touch.',
  ],
}

const PHOTO = `${import.meta.env.BASE_URL}assets/profile.jpg`

export default function ArtistProfile() {
  const [failed, setFailed] = useState(false)
  return (
    <section id="artist" className="section artist">
      <h2 className="section-title">The artist</h2>
      <div className="artist-grid">
        <figure className="artist-photo">
          {failed ? (
            <div className="artist-photo-missing">
              Add your photo at<br /><code>public/assets/profile.jpg</code>
            </div>
          ) : (
            <img src={PHOTO} alt={`Portrait of ${profile.name}`} onError={() => setFailed(true)} />
          )}
        </figure>
        <div className="artist-copy">
          <h3>{profile.name}</h3>
          <p className="artist-role">{profile.role}</p>
          {profile.bio.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  )
}
