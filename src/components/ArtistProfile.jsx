
import { useState } from 'react'

const profile = {
  name: 'Negative Realm',
  role: 'Poet and collector of anatomical graphics',
  bio: [
    'Negative Realm writes the poems and gathers the anatomical engravings that make up “At Least Until My Body Give Up On Me”.',
    'Negative Realm is a dark illustrator born and raised in Bandung. Over time, a bleak visual direction took shape around quiet solitude, eventually forming the moniker Negative Realm',
  ],
}

const PHOTO = `${import.meta.env.BASE_URL}assets/negativerealm.png`

export default function ArtistProfile() {
  const [failed, setFailed] = useState(false)

  return (
    <section id="about" className="section artist">
      <div className="artist-grid">
        <figure className="artist-photo">
          {failed ? (
            <div className="artist-photo-missing">
              Add your photo at<br />
              <code>public/assets/negativerealm.png</code>
            </div>
          ) : (
            <img
              src={PHOTO}
              alt={`Portrait of ${profile.name}`}
              onError={() => setFailed(true)}
            />
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
