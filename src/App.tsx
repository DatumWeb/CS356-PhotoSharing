import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import avatarPhotoUrl from './assets/scottlarsen.jpeg'
import './App.css'

type SortOrder = 'desc' | 'asc'
type EventType =
  | 'Graduation'
  | 'Family Reunion'
  | 'Office'
  | 'Team Offsite'
  | 'Conference'
  | 'Product'
  | 'Misc'

type Photo = {
  id: string
  title: string
  event: EventType
  date: string
  owner: string
  album: string | null
  tags: string[]
  url: string
  description: string
}

type Toast = {
  id: number
  message: string
}

type Album = {
  id: string
  name: string
  isPublic: boolean
  collaborators: string
  tags: string[]
  photoIds: string[]
}

type AppScreen = 'photos' | 'albums' | 'album-detail'

const seedTags = [
  'Graduation',
  'Family Reunion',
  'Partying',
  'Dancing',
  'Laughter',
  'Diploma',
  'Grad gear',
  'Photo with mascot',
  'Group photos',
  'Candid photos',
  'People laughing',
  'People crying',
  'Grandparents',
  'The whole family',
  'Memories',
  'Stories',
  'Family photos',
  'Office',
  'Desk',
  'Coffee',
  'Laptop',
  'Meeting',
  'Whiteboard',
  'Presentation',
  'Chicago',
  'Airport',
  'Travel',
  'Food',
  'Breakfast',
  'Team building',
  'Branding',
  'City',
  'Nature',
  'Beach',
  'Hiking',
  'Misc',
  'Sneakers',
  'Workspace',
  'Rooftop',
  'Happy hour',
  'Water',
]

const initialPhotos: Photo[] = [
  {
    id: 'g-001',
    title: 'Caps in the air',
    event: 'Graduation',
    date: '2026-03-12T14:30:00',
    owner: 'Allan Evans',
    album: 'Campus Day',
    tags: ['Graduation', 'Grad gear', 'Group photos', 'People laughing'],
    url: 'https://plus.unsplash.com/premium_photo-1713296255442-e9338f42aad8?q=80&w=1022&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'The whole crew tossing caps after the ceremony.',
  },
  {
    id: 'f-001',
    title: 'Sunset on the beach',
    event: 'Family Reunion',
    date: '2026-03-18T12:05:00',
    owner: 'Kevin Young',
    album: 'Family Moments',
    tags: ['Family Reunion', 'Grandparents', 'Stories', 'Memories', 'Family photos'],
    url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
    description: 'Everyone together for golden hour on the last night.',
  },
  {
    id: 'f-002',
    title: 'Crafts with the cousins',
    event: 'Family Reunion',
    date: '2026-03-18T16:40:00',
    owner: 'Allan Evans',
    album: 'Family Moments',
    tags: ['Family Reunion', 'Candid photos', 'The whole family', 'Partying'],
    url: 'https://images.unsplash.com/photo-1485546784815-e380f3297414?auto=format&fit=crop&w=1200&q=80',
    description: 'Painting ornaments at the craft table after lunch.',
  },
  {
    id: 'g-002',
    title: 'Ready to walk',
    event: 'Graduation',
    date: '2026-03-12T11:10:00',
    owner: 'Kevin Young',
    album: null,
    tags: ['Graduation', 'Photo with mascot', 'Group photos', 'Memories'],
    url: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80',
    description: 'One last look back before walking across the stage.',
  },
  {
    id: 'o-001',
    title: 'Espresso machine guilt',
    event: 'Office',
    date: '2026-02-03T08:40:00',
    owner: 'Jamie Rivera',
    album: 'Q4 Kickoff',
    tags: ['Office', 'Coffee', 'Breakfast', 'Desk'],
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
    description: 'Someone finally cleaned the drip tray. It lasted almost a full day.',
  },
  {
    id: 'o-002',
    title: 'Slides that could have been an email',
    event: 'Office',
    date: '2026-02-03T10:15:00',
    owner: 'Dr. Scott',
    album: 'Q4 Kickoff',
    tags: ['Office', 'Meeting', 'Presentation', 'Whiteboard'],
    url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80',
    description: 'Forty-seven minutes of alignment. The snacks were good though.',
  },
  {
    id: 'o-003',
    title: 'Parking-lot sunrise',
    event: 'Office',
    date: '2026-02-04T07:55:00',
    owner: 'Morgan Lee',
    album: 'Q4 Kickoff',
    tags: ['Office', 'City', 'Travel', 'Misc'],
    url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80',
    description: 'Got here before the badge readers woke up.',
  },
  {
    id: 'o-004',
    title: 'Cable management (aspirational)',
    event: 'Office',
    date: '2026-01-18T16:20:00',
    owner: 'Alex Chen',
    album: 'Office Life',
    tags: ['Office', 'Desk', 'Laptop', 'Workspace'],
    url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
    description: 'Two monitors, one dream, zero spare HDMI adapters.',
  },
  {
    id: 'o-005',
    title: 'Stand-up that ran long',
    event: 'Office',
    date: '2026-01-22T09:45:00',
    owner: 'Priya Patel',
    album: 'Office Life',
    tags: ['Office', 'Meeting', 'Whiteboard', 'Team building'],
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    description: 'We blamed the new project management tool. Again.',
  },
  {
    id: 'o-006',
    title: 'Plant custody rotation',
    event: 'Office',
    date: '2026-01-29T13:10:00',
    owner: 'Sam Torres',
    album: 'Office Life',
    tags: ['Office', 'Desk', 'Misc', 'Nature'],
    url: 'https://images.unsplash.com/photo-1463320898484-cdee8141c787?auto=format&fit=crop&w=1200&q=80',
    description: 'If this fern dies on my watch I am changing teams.',
  },
  {
    id: 't-001',
    title: 'Ferry deck wind',
    event: 'Team Offsite',
    date: '2025-09-14T11:30:00',
    owner: 'Kevin Young',
    album: 'Seattle Trip',
    tags: ['Team building', 'Travel', 'Nature', 'Water'],
    url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1200&q=80',
    description: 'Nobody brought a jacket. Everyone pretended they meant to.',
  },
  {
    id: 't-002',
    title: 'Pike Place chaos',
    event: 'Team Offsite',
    date: '2025-09-14T15:05:00',
    owner: 'Allan Evans',
    album: 'Seattle Trip',
    tags: ['Team building', 'Food', 'Travel', 'City'],
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    description: 'Fish flew. Cameras came out. HR said we could keep this one.',
  },
  {
    id: 't-003',
    title: 'Airport floor breakfast',
    event: 'Team Offsite',
    date: '2025-09-13T06:40:00',
    owner: 'Luke Hymas',
    album: 'Seattle Trip',
    tags: ['Airport', 'Breakfast', 'Travel', 'Misc'],
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    description: 'The only acceptable use of a $14 airport croissant.',
  },
  {
    id: 't-004',
    title: 'Escape room: we did not escape',
    event: 'Team Offsite',
    date: '2025-11-02T19:10:00',
    owner: 'Jamie Rivera',
    album: 'Rooftop & Hangs',
    tags: ['Team building', 'Happy hour', 'City', 'Misc'],
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    description: 'We blamed the intern. The intern blamed the hint system.',
  },
  {
    id: 't-005',
    title: 'Rooftop golden hour',
    event: 'Team Offsite',
    date: '2025-11-02T20:45:00',
    owner: 'Dr. Scott',
    album: 'Rooftop & Hangs',
    tags: ['Rooftop', 'Happy hour', 'City', 'Team building'],
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    description: 'Someone suggested karaoke. We ordered more fries instead.',
  },
  {
    id: 'm-001',
    title: 'Dog in a hoodie (not ours)',
    event: 'Misc',
    date: '2025-12-01T14:22:00',
    owner: 'Morgan Lee',
    album: null,
    tags: ['Misc', 'Candid photos', 'People laughing'],
    url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80',
    description: 'Met at the crosswalk. Named him Budget. Never saw him again.',
  },
  {
    id: 'm-002',
    title: 'Highway rest stop clouds',
    event: 'Misc',
    date: '2025-08-19T17:50:00',
    owner: 'Alex Chen',
    album: null,
    tags: ['Travel', 'Nature', 'Memories'],
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    description: 'GPS said scenic route. GPS was feeling dramatic.',
  },
  {
    id: 'm-003',
    title: 'Farmers market tomatoes',
    event: 'Misc',
    date: '2026-01-11T10:15:00',
    owner: 'Priya Patel',
    album: 'Snack Wall',
    tags: ['Food', 'Breakfast', 'Misc'],
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
    description: 'We bought six. Ate two in the parking lot.',
  },
  {
    id: 'm-004',
    title: 'Donut wall aftermath',
    event: 'Misc',
    date: '2026-01-11T11:40:00',
    owner: 'Sam Torres',
    album: 'Snack Wall',
    tags: ['Food', 'Partying', 'Office'],
    url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1200&q=80',
    description: 'Marketing promised restraint. Marketing was optimistic.',
  },
  {
    id: 'm-005',
    title: 'Hiking trail mud tax',
    event: 'Misc',
    date: '2025-10-05T09:30:00',
    owner: 'Luke Hymas',
    album: null,
    tags: ['Hiking', 'Nature', 'Group photos'],
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
    description: 'The group chat still argues about who suggested “easy loop.”',
  },
  {
    id: 'm-006',
    title: 'Beach umbrella geometry',
    event: 'Misc',
    date: '2025-07-22T16:00:00',
    owner: 'Allan Evans',
    album: null,
    tags: ['Beach', 'Travel', 'Memories'],
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    description: 'Sand in the laptop bag. Worth it, allegedly.',
  },
  {
    id: 'm-007',
    title: 'Conference badge collection',
    event: 'Conference',
    date: '2025-11-18T08:10:00',
    owner: 'Dr. Scott',
    album: null,
    tags: ['Conference', 'Travel', 'Chicago', 'Presentation'],
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    description: 'Twelve lanyards, one personality.',
  },
  {
    id: 'm-008',
    title: 'Airport moving walkway sprint',
    event: 'Misc',
    date: '2025-11-18T18:55:00',
    owner: 'Kevin Young',
    album: null,
    tags: ['Airport', 'Travel', 'Misc'],
    url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
    description: 'We still missed the connection. Spirit intact, bags less so.',
  },
  {
    id: 'p-001',
    title: 'Sneaker drop flat lay',
    event: 'Product',
    date: '2026-01-08T13:00:00',
    owner: 'Jamie Rivera',
    album: 'Product Drops',
    tags: ['Product', 'Sneakers', 'Branding'],
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
    description: 'Creative said “more energy.” We rotated the left shoe 4°.',
  },
  {
    id: 'p-002',
    title: 'Headphones hero shot',
    event: 'Product',
    date: '2026-01-08T13:45:00',
    owner: 'Morgan Lee',
    album: 'Product Drops',
    tags: ['Product', 'Branding', 'Desk'],
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    description: 'Reflections edited until Legal stopped answering Slack.',
  },
  {
    id: 'c-001',
    title: 'Keynote crowd blur',
    event: 'Conference',
    date: '2025-10-28T10:00:00',
    owner: 'Dr. Scott',
    album: 'Chicago 2025',
    tags: ['Conference', 'Chicago', 'Presentation', 'Meeting'],
    url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
    description: 'Stage lights, free tote bags, mild existential dread.',
  },
  {
    id: 'c-002',
    title: 'Expo hall carpet fatigue',
    event: 'Conference',
    date: '2025-10-28T14:30:00',
    owner: 'Luke Hymas',
    album: 'Chicago 2025',
    tags: ['Conference', 'Chicago', 'Team building'],
    url: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=1200&q=80',
    description: 'We collected seventeen stickers and one questionable stress ball.',
  },
]

/** Demo-only: organization and user shown in the shell (no real auth). */
const DEMO_ORG_NAME = 'Acme Inc'
const APP_DISPLAY_NAME = 'PhotoTag'
const DEMO_USER_DISPLAY_NAME = 'Dr. Scott'

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type CardOwnerFilterProps = {
  owner: string
  onActivate: (owner: string) => void
}

function CardOwnerFilter({ owner, onActivate }: CardOwnerFilterProps) {
  return (
    <span
      className="card-owner-wrap"
      role="button"
      tabIndex={0}
      aria-label={`View all photos by ${owner}`}
      onClick={(event) => {
        event.stopPropagation()
        onActivate(owner)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          event.stopPropagation()
          onActivate(owner)
        }
      }}
    >
      <span className="card-owner-line">
        <span className="card-owner-arrow" aria-hidden="true">
          ›
        </span>
        <span className="card-owner-prefix" aria-hidden="true">
          View all by{' '}
        </span>
        <span className="card-owner-name">{owner}</span>
      </span>
    </span>
  )
}

function EmptyStateBlock({
  title,
  detail,
  onReset,
  resetLabel = 'Reset filters',
}: {
  title: string
  detail: string
  onReset?: () => void
  resetLabel?: string
}) {
  return (
    <div className="empty-state-card" role="status">
      <div className="empty-state-icon" aria-hidden="true">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-detail">{detail}</p>
      {onReset && (
        <button type="button" className="btn-secondary empty-state-action" onClick={onReset}>
          {resetLabel}
        </button>
      )}
    </div>
  )
}

function photoHasTag(photo: Photo, tag: string) {
  return photo.tags.includes(tag) || photo.event === tag
}

function mergeUniqueTags(lists: string[][]) {
  const set = new Set<string>()
  for (const list of lists) {
    for (const t of list) set.add(t)
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}

function filterPhotosBySearchAndDates(
  pool: Photo[],
  searchQuery: string,
  sortOrder: SortOrder,
  startDate: string,
  endDate: string,
): Photo[] {
  const query = searchQuery.trim().toLowerCase()
  return [...pool]
    .filter((photo) => {
      const matchesQuery =
        query.length === 0 ||
        photo.title.toLowerCase().includes(query) ||
        photo.description.toLowerCase().includes(query) ||
        photo.owner.toLowerCase().includes(query) ||
        photo.tags.some((tag) => tag.toLowerCase().includes(query))

      const photoDate = new Date(photo.date).getTime()
      const matchesStart = !startDate || photoDate >= new Date(`${startDate}T00:00:00`).getTime()
      const matchesEnd = !endDate || photoDate <= new Date(`${endDate}T23:59:59`).getTime()

      return matchesQuery && matchesStart && matchesEnd
    })
    .sort((a, b) =>
      sortOrder === 'desc'
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime(),
    )
}

function buildPhotoFeedSections(photos: Photo[], selectedTags: string[]) {
  if (selectedTags.length === 0) {
    return [{ key: 'all', title: `All ${DEMO_ORG_NAME} photos`, photos }]
  }
  return selectedTags.map((tag) => ({
    key: tag,
    title: tag,
    photos: photos.filter((photo) => photoHasTag(photo, tag)),
  }))
}

function buildAlbumFeedSections(albums: Album[], selectedTags: string[]) {
  if (selectedTags.length === 0) {
    return [{ key: 'all', title: `All ${DEMO_ORG_NAME} albums`, albums }]
  }
  return selectedTags.map((tag) => ({
    key: tag,
    title: tag,
    albums: albums.filter((a) => a.tags.includes(tag)),
  }))
}

const initialAlbums: Album[] = [
  {
    id: 'album-campus',
    name: 'Campus Day',
    isPublic: true,
    collaborators: 'Kevin Young',
    tags: ['Graduation', 'Group photos'],
    photoIds: ['g-001', 'g-002'],
  },
  {
    id: 'album-family',
    name: 'Family Moments',
    isPublic: false,
    collaborators: 'Allan Evans',
    tags: ['Family Reunion', 'Candid photos'],
    photoIds: ['f-001', 'f-002'],
  },
  {
    id: 'album-kickoff',
    name: 'Q4 Kickoff',
    isPublic: false,
    collaborators: 'Dr. Scott, Jamie Rivera, Morgan Lee',
    tags: ['Office', 'Meeting'],
    photoIds: ['o-001', 'o-002', 'o-003'],
  },
  {
    id: 'album-office-life',
    name: 'Office Life',
    isPublic: true,
    collaborators: 'Priya Patel, Sam Torres, Alex Chen',
    tags: ['Office', 'Desk'],
    photoIds: ['o-004', 'o-005', 'o-006'],
  },
  {
    id: 'album-seattle',
    name: 'Seattle Trip',
    isPublic: true,
    collaborators: 'Kevin Young, Allan Evans, Luke Hymas',
    tags: ['Travel', 'Team building'],
    photoIds: ['t-001', 't-002', 't-003'],
  },
  {
    id: 'album-rooftop',
    name: 'Rooftop & Hangs',
    isPublic: false,
    collaborators: 'Jamie Rivera, Dr. Scott',
    tags: ['Rooftop', 'Happy hour'],
    photoIds: ['t-004', 't-005'],
  },
  {
    id: 'album-snacks',
    name: 'Snack Wall',
    isPublic: true,
    collaborators: 'Sam Torres, Priya Patel',
    tags: ['Food', 'Office'],
    photoIds: ['m-003', 'm-004'],
  },
  {
    id: 'album-product',
    name: 'Product Drops',
    isPublic: true,
    collaborators: 'Jamie Rivera, Morgan Lee',
    tags: ['Product', 'Branding'],
    photoIds: ['p-001', 'p-002'],
  },
  {
    id: 'album-chicago',
    name: 'Chicago 2025',
    isPublic: true,
    collaborators: 'Dr. Scott, Luke Hymas',
    tags: ['Conference', 'Chicago'],
    photoIds: ['c-001', 'c-002'],
  },
]

function App() {
  const [screen, setScreen] = useState<AppScreen>('photos')
  const [albums, setAlbums] = useState<Album[]>(initialAlbums)
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null)
  const nextAlbumIdRef = useRef(100)
  const nextUploadPhotoIdRef = useRef(9000)
  const uploadFileInputRef = useRef<HTMLInputElement>(null)
  const uploadProgressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const photosSearchInputRef = useRef<HTMLInputElement>(null)
  const detailSearchInputRef = useRef<HTMLInputElement>(null)
  const savedPickerSearchInputRef = useRef<HTMLInputElement>(null)

  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null)
  const [showComments, setShowComments] = useState(false)
  const [commentDraft, setCommentDraft] = useState('')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [showActiveTagsPanel, setShowActiveTagsPanel] = useState(false)
  const [activeTagPickerQuery, setActiveTagPickerQuery] = useState('')
  const [lightboxMenuOpen, setLightboxMenuOpen] = useState(false)
  const [showDeletePhotoDialog, setShowDeletePhotoDialog] = useState(false)
  const [showAddTagPopup, setShowAddTagPopup] = useState(false)
  const [addTagQuery, setAddTagQuery] = useState('')
  const [showAllTagsModal, setShowAllTagsModal] = useState(false)
  const [allTagsModalDraft, setAllTagsModalDraft] = useState<string[]>([])
  const [allTagsModalSearch, setAllTagsModalSearch] = useState('')
  const toastIdRef = useRef(0)

  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false)
  const [createAlbumName, setCreateAlbumName] = useState('')
  const [createAlbumPublic, setCreateAlbumPublic] = useState(false)
  const [createAlbumCollaborators, setCreateAlbumCollaborators] = useState('')
  const [createAlbumTagsDraft, setCreateAlbumTagsDraft] = useState<string[]>([])
  const [createAlbumTagsSearch, setCreateAlbumTagsSearch] = useState('')

  const [albumListSelectedTags, setAlbumListSelectedTags] = useState<string[]>([])
  const [albumListSearch, setAlbumListSearch] = useState('')
  const [albumListSort, setAlbumListSort] = useState<SortOrder>('desc')
  const [albumListStart, setAlbumListStart] = useState('')
  const [albumListEnd, setAlbumListEnd] = useState('')
  const [albumListShowActivePanel, setAlbumListShowActivePanel] = useState(false)
  const [albumListTagPicker, setAlbumListTagPicker] = useState('')
  const [showAlbumListAllTagsModal, setShowAlbumListAllTagsModal] = useState(false)
  const [albumListTagsModalDraft, setAlbumListTagsModalDraft] = useState<string[]>([])
  const [albumListTagsModalSearch, setAlbumListTagsModalSearch] = useState('')

  const [detailPendingSearch, setDetailPendingSearch] = useState('')
  const [detailPendingSort, setDetailPendingSort] = useState<SortOrder>('desc')
  const [detailPendingStart, setDetailPendingStart] = useState('')
  const [detailPendingEnd, setDetailPendingEnd] = useState('')
  const [detailPendingSectionTags, setDetailPendingSectionTags] = useState<string[]>([])
  const [detailAppliedSearch, setDetailAppliedSearch] = useState('')
  const [detailAppliedSort, setDetailAppliedSort] = useState<SortOrder>('desc')
  const [detailAppliedStart, setDetailAppliedStart] = useState('')
  const [detailAppliedEnd, setDetailAppliedEnd] = useState('')
  const [detailAppliedSectionTags, setDetailAppliedSectionTags] = useState<string[]>([])
  const [detailShowActivePanel, setDetailShowActivePanel] = useState(false)
  const [detailTagPicker, setDetailTagPicker] = useState('')
  const [showDetailAllTagsModal, setShowDetailAllTagsModal] = useState(false)
  const [detailTagsModalDraft, setDetailTagsModalDraft] = useState<string[]>([])
  const [detailTagsModalSearch, setDetailTagsModalSearch] = useState('')
  const [showAddToAlbumModal, setShowAddToAlbumModal] = useState(false)

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadPickUrl, setUploadPickUrl] = useState<string | null>(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadInFlight, setUploadInFlight] = useState(false)
  const [uploadFileMeta, setUploadFileMeta] = useState<{ name: string; size: number } | null>(null)
  const [uploadDragActive, setUploadDragActive] = useState(false)

  const knownTags = useMemo(
    () => mergeUniqueTags([seedTags, ...photos.map((p) => p.tags)]),
    [photos],
  )

  const openPhoto = (photo: Photo) => {
    setLightboxMenuOpen(false)
    setShowDeletePhotoDialog(false)
    setActivePhoto(photo)
  }

  const closePhoto = useCallback(() => {
    setLightboxMenuOpen(false)
    setShowDeletePhotoDialog(false)
    setActivePhoto(null)
  }, [])

  const showToast = (message: string) => {
    const id = ++toastIdRef.current
    setToasts((prev) => [...prev, { id, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 2800)
  }

  const applyUploaderFilter = (owner: string) => {
    if (showAddToAlbumModal) {
      setSearchQuery(owner)
      showToast(`Search set to “${owner}”.`)
      window.requestAnimationFrame(() => savedPickerSearchInputRef.current?.focus())
      return
    }
    if (screen === 'photos') {
      setSearchQuery(owner)
      showToast(`Search set to “${owner}”.`)
      window.requestAnimationFrame(() => photosSearchInputRef.current?.focus())
      return
    }
    if (screen === 'album-detail') {
      setDetailPendingSearch(owner)
      setDetailAppliedSearch(owner)
      showToast(`Searching this album for “${owner}”.`)
      window.requestAnimationFrame(() => detailSearchInputRef.current?.focus())
    }
  }

  const addFilterTagIfExists = (tag: string) => {
    const normalized = tag.trim()
    if (!normalized) return
    const match =
      knownTags.find((t) => t.toLowerCase() === normalized.toLowerCase()) ?? null
    if (!match) {
      showToast(`No tag "${normalized}" in the library yet. Add it from a photo first.`)
      return
    }
    setSelectedTags((prev) => (prev.includes(match) ? prev : [...prev, match]))
    setActiveTagPickerQuery('')
    showToast(`Filter includes: ${match}`)
  }

  const filteredPhotos = useMemo(
    () => filterPhotosBySearchAndDates(photos, searchQuery, sortOrder, startDate, endDate),
    [photos, searchQuery, sortOrder, startDate, endDate],
  )

  const feedSections = useMemo(
    () => buildPhotoFeedSections(filteredPhotos, selectedTags),
    [filteredPhotos, selectedTags],
  )

  const activeAlbum = useMemo(
    () => (activeAlbumId ? (albums.find((a) => a.id === activeAlbumId) ?? null) : null),
    [albums, activeAlbumId],
  )

  const lightboxPool = useMemo(() => {
    if (screen === 'album-detail' && activeAlbum) {
      return photos.filter((p) => activeAlbum.photoIds.includes(p.id))
    }
    return filteredPhotos
  }, [screen, activeAlbum, photos, filteredPhotos])

  const navigatePhoto = useCallback((direction: 1 | -1) => {
    if (!activePhoto) return
    const idx = lightboxPool.findIndex((p) => p.id === activePhoto.id)
    if (idx === -1) return
    const next = idx + direction
    if (next < 0 || next >= lightboxPool.length) return
    setLightboxMenuOpen(false)
    setActivePhoto(lightboxPool[next])
  }, [activePhoto, lightboxPool])

  const activePhotoIndex = activePhoto ? lightboxPool.findIndex((p) => p.id === activePhoto.id) : -1
  const hasPrev = activePhotoIndex > 0
  const hasNext = activePhotoIndex >= 0 && activePhotoIndex < lightboxPool.length - 1

  useEffect(() => {
    return () => {
      if (uploadProgressTimerRef.current) {
        clearInterval(uploadProgressTimerRef.current)
        uploadProgressTimerRef.current = null
      }
    }
  }, [])

  const filteredAlbumsList = useMemo(() => {
    const query = albumListSearch.trim().toLowerCase()
    const pool = albums.filter((album) => {
      const matchesTags =
        albumListSelectedTags.length === 0 ||
        albumListSelectedTags.every((t) => album.tags.includes(t))
      const matchesQuery =
        query.length === 0 ||
        album.name.toLowerCase().includes(query) ||
        album.collaborators.toLowerCase().includes(query) ||
        album.tags.some((t) => t.toLowerCase().includes(query))

      const albumPhotos = photos.filter((p) => album.photoIds.includes(p.id))
      const matchesDates = (() => {
        if (!albumListStart && !albumListEnd) return true
        if (albumPhotos.length === 0) return false
        return albumPhotos.some((photo) => {
          const photoDate = new Date(photo.date).getTime()
          const matchesStart =
            !albumListStart || photoDate >= new Date(`${albumListStart}T00:00:00`).getTime()
          const matchesEnd =
            !albumListEnd || photoDate <= new Date(`${albumListEnd}T23:59:59`).getTime()
          return matchesStart && matchesEnd
        })
      })()

      return matchesTags && matchesQuery && matchesDates
    })

    return pool.sort((a, b) => {
      const newest = (album: Album) =>
        Math.max(
          0,
          ...photos.filter((p) => album.photoIds.includes(p.id)).map((p) => new Date(p.date).getTime()),
        )
      const na = newest(a)
      const nb = newest(b)
      return albumListSort === 'desc' ? nb - na : na - nb
    })
  }, [
    albums,
    photos,
    albumListSearch,
    albumListSelectedTags,
    albumListStart,
    albumListEnd,
    albumListSort,
  ])

  const albumListFeedSections = useMemo(
    () => buildAlbumFeedSections(filteredAlbumsList, albumListSelectedTags),
    [filteredAlbumsList, albumListSelectedTags],
  )

  const albumDetailPool = useMemo(() => {
    if (!activeAlbum) return []
    return photos.filter((p) => activeAlbum.photoIds.includes(p.id))
  }, [photos, activeAlbum])

  const albumDetailFilteredPhotos = useMemo(
    () =>
      filterPhotosBySearchAndDates(
        albumDetailPool,
        detailAppliedSearch,
        detailAppliedSort,
        detailAppliedStart,
        detailAppliedEnd,
      ),
    [albumDetailPool, detailAppliedSearch, detailAppliedSort, detailAppliedStart, detailAppliedEnd],
  )

  const albumDetailFeedSections = useMemo(
    () => buildPhotoFeedSections(albumDetailFilteredPhotos, detailAppliedSectionTags),
    [albumDetailFilteredPhotos, detailAppliedSectionTags],
  )

  const savedPickerPool = useMemo(() => {
    if (!activeAlbum) return []
    return photos.filter((p) => !activeAlbum.photoIds.includes(p.id))
  }, [photos, activeAlbum])

  const savedPickerFilteredPhotos = useMemo(
    () =>
      filterPhotosBySearchAndDates(
        savedPickerPool,
        searchQuery,
        sortOrder,
        startDate,
        endDate,
      ),
    [savedPickerPool, searchQuery, sortOrder, startDate, endDate],
  )

  const savedPickerFeedSections = useMemo(
    () => buildPhotoFeedSections(savedPickerFilteredPhotos, selectedTags),
    [savedPickerFilteredPhotos, selectedTags],
  )

  const modalTagsFiltered = useMemo(() => {
    const q = allTagsModalSearch.trim().toLowerCase()
    return knownTags.filter((t) => !q || t.toLowerCase().includes(q))
  }, [knownTags, allTagsModalSearch])

  const openAllTagsModal = () => {
    setAllTagsModalDraft([...selectedTags])
    setAllTagsModalSearch('')
    setShowAllTagsModal(true)
  }

  const toggleDraftTag = (tag: string) => {
    setAllTagsModalDraft((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  const confirmAllTagsModal = () => {
    setSelectedTags(allTagsModalDraft)
    setShowAllTagsModal(false)
  }

  const goToPhotos = () => {
    setScreen('photos')
    setActiveAlbumId(null)
  }

  const goToAlbumsList = () => {
    setScreen('albums')
    setActiveAlbumId(null)
  }

  const openAlbumDetailPage = (albumId: string) => {
    setActiveAlbumId(albumId)
    setScreen('album-detail')
    setDetailPendingSearch('')
    setDetailPendingSort('desc')
    setDetailPendingStart('')
    setDetailPendingEnd('')
    setDetailPendingSectionTags([])
    setDetailAppliedSearch('')
    setDetailAppliedSort('desc')
    setDetailAppliedStart('')
    setDetailAppliedEnd('')
    setDetailAppliedSectionTags([])
    setDetailShowActivePanel(false)
    setDetailTagPicker('')
    setShowAddToAlbumModal(false)
    setShowDetailAllTagsModal(false)
  }

  const openSavedPhotosPicker = () => {
    // Reuse the Photos-style sidebar search + filters so adding from saved photos feels the same.
    setSearchQuery(detailPendingSearch)
    setSortOrder(detailPendingSort)
    setStartDate(detailPendingStart)
    setEndDate(detailPendingEnd)
    setSelectedTags([...detailPendingSectionTags])
    setShowActiveTagsPanel(false)
    setActiveTagPickerQuery('')
    setShowAllTagsModal(false)
    setShowAddToAlbumModal(true)
  }

  const closeSavedPhotosPicker = useCallback(() => {
    setShowAddToAlbumModal(false)
  }, [])

  const openCreateAlbumModal = () => {
    setCreateAlbumName('')
    setCreateAlbumPublic(false)
    setCreateAlbumCollaborators('')
    setCreateAlbumTagsDraft([])
    setCreateAlbumTagsSearch('')
    setShowCreateAlbumModal(true)
  }

  const toggleCreateAlbumTag = (tag: string) => {
    setCreateAlbumTagsDraft((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  const submitCreateAlbum = () => {
    const name = createAlbumName.trim()
    if (!name) {
      showToast('Please enter an album name.')
      return
    }
    nextAlbumIdRef.current += 1
    const id = `album-${nextAlbumIdRef.current}`
    const album: Album = {
      id,
      name,
      isPublic: createAlbumPublic,
      collaborators: createAlbumCollaborators.trim(),
      tags: [...createAlbumTagsDraft],
      photoIds: [],
    }
    setAlbums((prev) => [...prev, album])
    setShowCreateAlbumModal(false)
    showToast(`Album “${name}” created.`)
    openAlbumDetailPage(id)
  }

  const addPhotoToAlbum = (photo: Photo) => {
    if (!activeAlbumId) return
    const album = albums.find((a) => a.id === activeAlbumId)
    if (!album) return
    if (album.photoIds.includes(photo.id)) {
      showToast('That photo is already in this album.')
      return
    }
    const albumName = album.name
    setAlbums((prev) =>
      prev.map((a) =>
        a.id === activeAlbumId ? { ...a, photoIds: [...a.photoIds, photo.id] } : a,
      ),
    )
    setPhotos((prev) =>
      prev.map((p) => (p.id === photo.id ? { ...p, album: albumName } : p)),
    )
    showToast(`Added “${photo.title}” to this album.`)
    closeSavedPhotosPicker()
  }

  const clearUploadProgressTimer = () => {
    if (uploadProgressTimerRef.current) {
      clearInterval(uploadProgressTimerRef.current)
      uploadProgressTimerRef.current = null
    }
  }

  const closeUploadModal = useCallback(() => {
    clearUploadProgressTimer()
    if (uploadPickUrl) {
      URL.revokeObjectURL(uploadPickUrl)
    }
    setShowUploadModal(false)
    setUploadPickUrl(null)
    setUploadTitle('')
    setUploadDescription('')
    setUploadProgress(0)
    setUploadInFlight(false)
    setUploadFileMeta(null)
    setUploadDragActive(false)
    if (uploadFileInputRef.current) uploadFileInputRef.current.value = ''
  }, [uploadPickUrl])

  const blockingLightboxKeys =
    showAddTagPopup ||
    showAllTagsModal ||
    showUploadModal ||
    showCreateAlbumModal ||
    showAlbumListAllTagsModal ||
    showDetailAllTagsModal ||
    showAddToAlbumModal ||
    showComments ||
    showDeletePhotoDialog

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeletePhotoDialog) {
          setShowDeletePhotoDialog(false)
          return
        }
        if (showAddTagPopup) {
          setShowAddTagPopup(false)
          return
        }
        if (showAllTagsModal) {
          setShowAllTagsModal(false)
          return
        }
        if (showUploadModal) {
          closeUploadModal()
          return
        }
        if (showCreateAlbumModal) {
          setShowCreateAlbumModal(false)
          return
        }
        if (showAlbumListAllTagsModal) {
          setShowAlbumListAllTagsModal(false)
          return
        }
        if (showDetailAllTagsModal) {
          setShowDetailAllTagsModal(false)
          return
        }
        if (showAddToAlbumModal) {
          closeSavedPhotosPicker()
          return
        }
        if (showComments) {
          setShowComments(false)
          return
        }
        if (activePhoto) {
          closePhoto()
        }
        return
      }
      if (
        activePhoto &&
        !blockingLightboxKeys &&
        (e.key === 'ArrowLeft' || e.key === 'ArrowRight')
      ) {
        e.preventDefault()
        if (e.key === 'ArrowLeft') navigatePhoto(-1)
        else navigatePhoto(1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    activePhoto,
    navigatePhoto,
    blockingLightboxKeys,
    closePhoto,
    closeSavedPhotosPicker,
    closeUploadModal,
    showAddTagPopup,
    showAddToAlbumModal,
    showAlbumListAllTagsModal,
    showAllTagsModal,
    showComments,
    showCreateAlbumModal,
    showDeletePhotoDialog,
    showDetailAllTagsModal,
    showUploadModal,
  ])

  useEffect(() => {
    const scrollLocked =
      Boolean(activePhoto) ||
      showAddTagPopup ||
      showAllTagsModal ||
      showUploadModal ||
      showCreateAlbumModal ||
      showAlbumListAllTagsModal ||
      showDetailAllTagsModal ||
      showAddToAlbumModal ||
      showComments ||
      showDeletePhotoDialog
    if (!scrollLocked) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [
    activePhoto,
    showAddTagPopup,
    showAddToAlbumModal,
    showAlbumListAllTagsModal,
    showAllTagsModal,
    showComments,
    showCreateAlbumModal,
    showDeletePhotoDialog,
    showDetailAllTagsModal,
    showUploadModal,
  ])

  const openUploadModal = () => {
    clearUploadProgressTimer()
    if (uploadPickUrl) {
      URL.revokeObjectURL(uploadPickUrl)
    }
    setUploadPickUrl(null)
    setUploadTitle('')
    setUploadDescription('')
    setUploadProgress(0)
    setUploadInFlight(false)
    setUploadFileMeta(null)
    setUploadDragActive(false)
    setShowUploadModal(true)
    if (uploadFileInputRef.current) uploadFileInputRef.current.value = ''
  }

  const applyUploadFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Use an image file (JPEG, PNG, GIF, or WebP).')
      return
    }
    const maxBytes = 25 * 1024 * 1024
    if (file.size > maxBytes) {
      showToast('For this demo, keep images under 25 MB.')
      return
    }
    if (uploadPickUrl) {
      URL.revokeObjectURL(uploadPickUrl)
    }
    const url = URL.createObjectURL(file)
    setUploadPickUrl(url)
    setUploadFileMeta({ name: file.name, size: file.size })
    const base = file.name.replace(/\.[^.]+$/, '').trim()
    setUploadTitle(base || 'Untitled photo')
    setUploadDescription('')
  }

  const onUploadFileChosen = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    applyUploadFile(file)
    event.target.value = ''
  }

  const onUploadDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setUploadDragActive(false)
    const file = event.dataTransfer.files?.[0]
    if (file) applyUploadFile(file)
  }

  const onUploadDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    setUploadDragActive(true)
  }

  const onUploadDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const next = event.relatedTarget as Node | null
    if (next && event.currentTarget.contains(next)) return
    setUploadDragActive(false)
  }

  const commitUploadedPhoto = (imageUrl: string, titleRaw: string, descriptionRaw: string) => {
    clearUploadProgressTimer()
    nextUploadPhotoIdRef.current += 1
    const photoId = `u-${nextUploadPhotoIdRef.current}`
    const title = titleRaw.trim() || 'Untitled photo'
    const description =
      descriptionRaw.trim() || 'Added from your device (demo upload to the shared library).'
    const albumName =
      screen === 'album-detail' && activeAlbum ? activeAlbum.name : null

    const newPhoto: Photo = {
      id: photoId,
      title,
      event: 'Misc',
      date: new Date().toISOString(),
      owner: DEMO_USER_DISPLAY_NAME,
      album: albumName,
      tags: ['Misc', 'Office'],
      url: imageUrl,
      description,
    }

    setPhotos((prev) => [newPhoto, ...prev])
    if (screen === 'album-detail' && activeAlbumId) {
      setAlbums((prev) =>
        prev.map((a) =>
          a.id === activeAlbumId ? { ...a, photoIds: [...a.photoIds, photoId] } : a,
        ),
      )
    }

    const where =
      albumName != null
        ? ` — also placed in “${albumName}”`
        : ` — in ${DEMO_ORG_NAME}'s shared library`
    showToast(`Uploaded as ${DEMO_USER_DISPLAY_NAME}${where}.`)
    setShowUploadModal(false)
    setUploadPickUrl(null)
    setUploadTitle('')
    setUploadDescription('')
    setUploadProgress(0)
    setUploadInFlight(false)
    setUploadFileMeta(null)
    setUploadDragActive(false)
    if (uploadFileInputRef.current) uploadFileInputRef.current.value = ''
  }

  const startDemoUpload = () => {
    if (!uploadPickUrl) {
      showToast('Choose a photo from your device first.')
      return
    }
    if (uploadInFlight) return
    const snapshotUrl = uploadPickUrl
    const snapshotTitle = uploadTitle.trim() || 'Untitled photo'
    const snapshotDesc =
      uploadDescription.trim() || 'Added from your device (demo upload to the shared library).'
    setUploadInFlight(true)
    setUploadProgress(0)
    clearUploadProgressTimer()
    let p = 0
    uploadProgressTimerRef.current = setInterval(() => {
      p += 9 + Math.floor(Math.random() * 5)
      if (p >= 100) {
        setUploadProgress(100)
        commitUploadedPhoto(snapshotUrl, snapshotTitle, snapshotDesc)
      } else {
        setUploadProgress(p)
      }
    }, 90)
  }

  const triggerFakeUploadFromDevice = () => {
    openUploadModal()
  }

  const applyAlbumDetailFilters = () => {
    setDetailAppliedSearch(detailPendingSearch)
    setDetailAppliedSort(detailPendingSort)
    setDetailAppliedStart(detailPendingStart)
    setDetailAppliedEnd(detailPendingEnd)
    setDetailAppliedSectionTags([...detailPendingSectionTags])
    showToast('Album view updated with your filters.')
  }

  const addAlbumListFilterTagIfExists = (tag: string) => {
    const normalized = tag.trim()
    if (!normalized) return
    const match =
      knownTags.find((t) => t.toLowerCase() === normalized.toLowerCase()) ?? null
    if (!match) {
      showToast(`No tag "${normalized}" in the library yet.`)
      return
    }
    setAlbumListSelectedTags((prev) => (prev.includes(match) ? prev : [...prev, match]))
    setAlbumListTagPicker('')
  }

  const addDetailPendingTagIfExists = (tag: string) => {
    const normalized = tag.trim()
    if (!normalized) return
    const match =
      knownTags.find((t) => t.toLowerCase() === normalized.toLowerCase()) ?? null
    if (!match) {
      showToast(`No tag "${normalized}" in the library yet.`)
      return
    }
    setDetailPendingSectionTags((prev) => (prev.includes(match) ? prev : [...prev, match]))
    setDetailTagPicker('')
  }

  const openAlbumListAllTagsModal = () => {
    setAlbumListTagsModalDraft([...albumListSelectedTags])
    setAlbumListTagsModalSearch('')
    setShowAlbumListAllTagsModal(true)
  }

  const toggleAlbumListModalTag = (tag: string) => {
    setAlbumListTagsModalDraft((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  const confirmAlbumListTagsModal = () => {
    setAlbumListSelectedTags(albumListTagsModalDraft)
    setShowAlbumListAllTagsModal(false)
  }

  const openDetailAllTagsModal = () => {
    setDetailTagsModalDraft([...detailPendingSectionTags])
    setDetailTagsModalSearch('')
    setShowDetailAllTagsModal(true)
  }

  const toggleDetailTagsModalTag = (tag: string) => {
    setDetailTagsModalDraft((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  const confirmDetailTagsModal = () => {
    setDetailPendingSectionTags(detailTagsModalDraft)
    setShowDetailAllTagsModal(false)
  }

  const albumListModalTagsFiltered = useMemo(() => {
    const q = albumListTagsModalSearch.trim().toLowerCase()
    return knownTags.filter((t) => !q || t.toLowerCase().includes(q))
  }, [knownTags, albumListTagsModalSearch])

  const albumListPickMatches = useMemo(() => {
    const q = albumListTagPicker.trim().toLowerCase()
    return knownTags
      .filter((t) => !albumListSelectedTags.includes(t))
      .filter((t) => !q || t.toLowerCase().includes(q))
      .slice(0, 12)
  }, [knownTags, albumListSelectedTags, albumListTagPicker])

  const detailTagsModalFiltered = useMemo(() => {
    const q = detailTagsModalSearch.trim().toLowerCase()
    return knownTags.filter((t) => !q || t.toLowerCase().includes(q))
  }, [knownTags, detailTagsModalSearch])

  const detailPickMatches = useMemo(() => {
    const q = detailTagPicker.trim().toLowerCase()
    return knownTags
      .filter((t) => !detailPendingSectionTags.includes(t))
      .filter((t) => !q || t.toLowerCase().includes(q))
      .slice(0, 12)
  }, [knownTags, detailPendingSectionTags, detailTagPicker])

  const createAlbumTagsFiltered = useMemo(() => {
    const q = createAlbumTagsSearch.trim().toLowerCase()
    return knownTags.filter((t) => !q || t.toLowerCase().includes(q))
  }, [knownTags, createAlbumTagsSearch])

  const pickMatches = useMemo(() => {
    const q = activeTagPickerQuery.trim().toLowerCase()
    return knownTags
      .filter((t) => !selectedTags.includes(t))
      .filter((t) => !q || t.toLowerCase().includes(q))
      .slice(0, 12)
  }, [knownTags, selectedTags, activeTagPickerQuery])

  const addTagMatches = useMemo(() => {
    if (!activePhoto) return []
    const q = addTagQuery.trim().toLowerCase()
    return knownTags
      .filter((t) => !activePhoto.tags.includes(t))
      .filter((t) => !q || t.toLowerCase().includes(q))
      .slice(0, 12)
  }, [knownTags, activePhoto, addTagQuery])

  const addTagExact = useMemo(() => {
    const q = addTagQuery.trim()
    if (!q) return null
    return knownTags.find((t) => t.toLowerCase() === q.toLowerCase()) ?? null
  }, [knownTags, addTagQuery])

  const applyTagsToPhoto = (photoId: string, nextTags: string[]) => {
    setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, tags: nextTags } : p)))
    setActivePhoto((prev) => (prev && prev.id === photoId ? { ...prev, tags: nextTags } : prev))
  }

  const applyTagsToActivePhoto = (tags: string[]) => {
    if (!activePhoto) return
    applyTagsToPhoto(activePhoto.id, tags)
  }

  const removeTagFromActivePhoto = (tag: string) => {
    if (!activePhoto) return
    const next = activePhoto.tags.filter((t) => t !== tag)
    applyTagsToActivePhoto(next)
    showToast(`Removed tag: ${tag}`)
  }

  const addTagToActivePhoto = (tag: string) => {
    if (!activePhoto) return
    const normalized = tag.trim()
    if (!normalized || activePhoto.tags.includes(normalized)) return
    applyTagsToActivePhoto([...activePhoto.tags, normalized])
    showToast(`Added tag: ${normalized}`)
  }

  const createAndAddTag = () => {
    if (!activePhoto) return
    const raw = addTagQuery.trim()
    if (!raw) return
    if (addTagExact) {
      addTagToActivePhoto(addTagExact)
    } else {
      addTagToActivePhoto(raw)
    }
    setAddTagQuery('')
    setShowAddTagPopup(false)
  }

  const confirmDeleteActivePhoto = () => {
    if (!activePhoto) return
    const id = activePhoto.id
    const title = activePhoto.title
    setPhotos((prev) => prev.filter((photo) => photo.id !== id))
    showToast(`"${title}" removed from the library.`)
    setShowDeletePhotoDialog(false)
    closePhoto()
  }

  const resetPhotosFilters = () => {
    setSelectedTags([])
    setSearchQuery('')
    setSortOrder('desc')
    setStartDate('')
    setEndDate('')
    setShowActiveTagsPanel(false)
    setShowAllTagsModal(false)
  }

  const resetAlbumListFilters = () => {
    setAlbumListSelectedTags([])
    setAlbumListSearch('')
    setAlbumListSort('desc')
    setAlbumListStart('')
    setAlbumListEnd('')
    setAlbumListShowActivePanel(false)
    setShowAlbumListAllTagsModal(false)
  }

  const resetDetailFilters = () => {
    setDetailPendingSearch('')
    setDetailPendingSort('desc')
    setDetailPendingStart('')
    setDetailPendingEnd('')
    setDetailPendingSectionTags([])
    setDetailShowActivePanel(false)
    setShowDetailAllTagsModal(false)
  }

  return (
    <div className="app">
      <header className="app-top-nav" role="banner">
        <div className="app-top-nav-brand">
          <img
            className="app-top-nav-logo"
            src={`${import.meta.env.BASE_URL}PhotoTag.png`}
            alt=""
            width={32}
            height={32}
          />
          <div className="app-top-nav-titles">
            <span className="app-top-nav-app-name">{APP_DISPLAY_NAME}</span>
            <span className="app-top-nav-tagline">
              Tag and sort your organization&apos;s photos — together in one library
            </span>
          </div>
        </div>
        <div
          className="app-top-nav-user"
          title="Demo preview — no account or sign-in"
        >
          <img
            className="app-top-nav-avatar"
            src={avatarPhotoUrl}
            alt=""
            width={34}
            height={34}
          />
          <span className="app-top-nav-user-meta">
            <span className="app-top-nav-user-label">Signed in as</span>
            <span className="app-top-nav-user-name">{DEMO_USER_DISPLAY_NAME}</span>
            <span className="app-top-nav-org">{DEMO_ORG_NAME}</span>
          </span>
        </div>
      </header>

      <header className="page-header page-header-bar">
        <div className="page-header-text">
          <div className="page-header-title-row page-header-title-row--org-context">
            <span className="page-header-org-mark" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4 21V10.5L12 4l8 6.5V21h-5v-6H9v6H4z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path d="M9 9h2v2H9V9zm4 0h2v2h-2V9z" fill="currentColor" />
              </svg>
            </span>
            <div className="page-header-title-main">
              <h1>
                {screen === 'photos' && `${DEMO_ORG_NAME}'s Photos`}
                {screen === 'albums' && `${DEMO_ORG_NAME}'s Albums`}
                {screen === 'album-detail' && activeAlbum && activeAlbum.name}
              </h1>
              <p className="page-header-viewing-as">
                <img
                  className="page-header-viewing-as-avatar"
                  src={avatarPhotoUrl}
                  alt=""
                  width={18}
                  height={18}
                />
                <span>
                  Viewing as {DEMO_USER_DISPLAY_NAME}
                </span>
              </p>
            </div>
          </div>
          <div className="header-description">
            <p>
            {screen === 'photos' &&
              `Browse and filter ${DEMO_ORG_NAME}'s shared library. Anyone on the team can add photos and tags so events stay easy to find and organize.`}
            {screen === 'albums' &&
              `Albums for ${DEMO_ORG_NAME}, organized by tags. Open an album to view photos or add more from the library.`}
            {screen === 'album-detail' && activeAlbum && (
              <>
                <span className="album-meta-badge">{activeAlbum.isPublic ? 'Public' : 'Private'}</span>
                {activeAlbum.collaborators && (
                  <> · Shared with {activeAlbum.collaborators}</>
                )}
                {' · '}
                {activeAlbum.photoIds.length} {activeAlbum.photoIds.length === 1 ? 'photo' : 'photos'}
              </>
            )}
          </p>
          </div>
          
        </div>
        <nav className="tab-selector" aria-label="Main navigation">
          <button
            type="button"
            className={screen === 'photos' ? 'tab-btn tab-active' : 'tab-btn'}
            onClick={goToPhotos}
            aria-current={screen === 'photos' ? 'page' : undefined}
          >
            {`${DEMO_ORG_NAME}'s Photos`}
          </button>
          <button
            type="button"
            className={screen === 'albums' || screen === 'album-detail' ? 'tab-btn tab-active' : 'tab-btn'}
            onClick={goToAlbumsList}
            aria-current={screen === 'albums' || screen === 'album-detail' ? 'page' : undefined}
          >
            {`${DEMO_ORG_NAME}'s Albums`}
          </button>
        </nav>
        <div className="header-actions">
          {screen === 'photos' && (
            <button type="button" className="btn-create" onClick={triggerFakeUploadFromDevice}>
              + Upload Photo
            </button>
          )}
          {screen === 'albums' && (
            <button type="button" className="btn-create" onClick={openCreateAlbumModal}>
              + Create Album
            </button>
          )}
        </div>
      </header>

      {screen === 'album-detail' && activeAlbum && (
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <button type="button" className="breadcrumb-link" onClick={goToAlbumsList}>
            {`${DEMO_ORG_NAME}'s Albums`}
          </button>
          <span className="breadcrumb-sep" aria-hidden="true">›</span>
          <span className="breadcrumb-current" aria-current="page">{activeAlbum.name}</span>
        </nav>
      )}

      {screen === 'photos' && (
      <div className="layout">
        <aside className="sidebar" aria-label="Filters and tag search">
          <div className="filter-panel">
            <button type="button" className="btn-reset filter-reset-top" onClick={resetPhotosFilters}>
              Reset filters
            </button>

            <div className="search-row">
              <input
                ref={photosSearchInputRef}
                className="search-input-full"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search titles, people, memories..."
                aria-label="Search photos"
              />
            </div>

            <div className="filter-row">
              <label className="filter-inline">
                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                >
                  <option value="desc">Newest first</option>
                  <option value="asc">Oldest first</option>
                </select>
              </label>
            </div>

            <div className="date-row">
              <label className="date-field">
                From
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </label>
              <label className="date-field">
                To
                <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
              </label>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowActiveTagsPanel((v) => !v)}
              aria-expanded={showActiveTagsPanel}
            >
              {showActiveTagsPanel ? '▾ Active tags' : '▸ Active tags'}
            </button>

            {showActiveTagsPanel && (
              <div className="active-tags-panel">
                <p className="panel-hint">
                  These tags control which sections appear. Search and dates still apply to every section.
                </p>
                {selectedTags.length === 0 ? (
                  <p className="panel-empty">No section tags yet. Use View all tags or search here.</p>
                ) : (
                  <ul className="active-tag-chips">
                    {selectedTags.map((tag) => (
                      <li key={tag}>
                        <span>{tag}</span>
                        <button
                          type="button"
                          className="chip-remove"
                          aria-label={`Remove ${tag} from active tags`}
                          onClick={() => setSelectedTags((prev) => prev.filter((t) => t !== tag))}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <label className="sr-only" htmlFor="active-tag-search">
                  Search tags to add to filter
                </label>
                <input
                  id="active-tag-search"
                  value={activeTagPickerQuery}
                  onChange={(event) => setActiveTagPickerQuery(event.target.value)}
                  placeholder="Search library tags to add…"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && pickMatches[0]) {
                      event.preventDefault()
                      addFilterTagIfExists(pickMatches[0])
                    }
                  }}
                />
                {pickMatches.length > 0 && (
                  <div className="suggestion-list" role="listbox">
                    {pickMatches.map((tag) => (
                      <button key={tag} type="button" className="suggestion" onClick={() => addFilterTagIfExists(tag)}>
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button type="button" className="btn-secondary btn-wide" onClick={openAllTagsModal}>
              View all tags
              {selectedTags.length > 0 ? ` (${selectedTags.length} selected)` : ''}
            </button>
          </div>
        </aside>

        <main className="main-column">
          {feedSections.map((section) => (
            <section key={section.key} className="event-section">
              <h2>{section.title} <span className="section-count">{section.photos.length}</span></h2>
              <div className="photo-grid">
                {section.photos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    className="photo-card"
                    onClick={() => openPhoto(photo)}
                  >
                    <img src={photo.url} alt={photo.title} loading="lazy" />
                    <div className="card-body">
                      <h3>"{photo.title}"</h3>
                      <CardOwnerFilter owner={photo.owner} onActivate={applyUploaderFilter} />
                      <p className="card-date">{new Date(photo.date).toLocaleDateString()}</p>
                    </div>
                  </button>
                ))}
                {section.photos.length === 0 && (
                  <EmptyStateBlock
                    title="Nothing in this section"
                    detail="Loosen dates, remove a tag, or shorten the search — then try again."
                    onReset={resetPhotosFilters}
                  />
                )}
              </div>
            </section>
          ))}
        </main>
      </div>
      )}

      {screen === 'albums' && (
        <div className="layout">
          <aside className="sidebar" aria-label="Album list filters">
            <div className="filter-panel">
              <button
                type="button"
                className="btn-reset filter-reset-top"
                onClick={() => {
                  setAlbumListSelectedTags([])
                  setAlbumListSearch('')
                  setAlbumListSort('desc')
                  setAlbumListStart('')
                  setAlbumListEnd('')
                  setAlbumListShowActivePanel(false)
                  setShowAlbumListAllTagsModal(false)
                }}
              >
                Reset filters
              </button>

              <div className="search-row">
                <input
                  className="search-input-full"
                  value={albumListSearch}
                  onChange={(event) => setAlbumListSearch(event.target.value)}
                  placeholder="Search album names, collaborators, tags..."
                  aria-label="Search albums"
                />
              </div>

              <div className="filter-row">
                <label className="filter-inline">
                  <select
                    value={albumListSort}
                    onChange={(event) => setAlbumListSort(event.target.value as SortOrder)}
                  >
                    <option value="desc">Newest first</option>
                    <option value="asc">Oldest first</option>
                  </select>
                </label>
              </div>

              <div className="date-row">
                <label className="date-field">
                  From
                  <input
                    type="date"
                    value={albumListStart}
                    onChange={(event) => setAlbumListStart(event.target.value)}
                  />
                </label>
                <label className="date-field">
                  To
                  <input
                    type="date"
                    value={albumListEnd}
                    onChange={(event) => setAlbumListEnd(event.target.value)}
                  />
                </label>
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => setAlbumListShowActivePanel((v) => !v)}
                aria-expanded={albumListShowActivePanel}
              >
                {albumListShowActivePanel ? '▾ Active tags' : '▸ Active tags'}
              </button>

              {albumListShowActivePanel && (
                <div className="active-tags-panel">
                  <p className="panel-hint">
                    Tags control which album sections appear (each section lists albums that use that tag).
                  </p>
                  {albumListSelectedTags.length === 0 ? (
                    <p className="panel-empty">No section tags. Use View all tags or search below.</p>
                  ) : (
                    <ul className="active-tag-chips">
                      {albumListSelectedTags.map((tag) => (
                        <li key={tag}>
                          <span>{tag}</span>
                          <button
                            type="button"
                            className="chip-remove"
                            aria-label={`Remove ${tag}`}
                            onClick={() =>
                              setAlbumListSelectedTags((prev) => prev.filter((t) => t !== tag))
                            }
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <input
                    value={albumListTagPicker}
                    onChange={(event) => setAlbumListTagPicker(event.target.value)}
                    placeholder="Search tags to add…"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && albumListPickMatches[0]) {
                        event.preventDefault()
                        addAlbumListFilterTagIfExists(albumListPickMatches[0])
                      }
                    }}
                  />
                  {albumListPickMatches.length > 0 && (
                    <div className="suggestion-list">
                      {albumListPickMatches.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className="suggestion"
                          onClick={() => addAlbumListFilterTagIfExists(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button type="button" className="btn-secondary btn-wide" onClick={openAlbumListAllTagsModal}>
                View all tags
                {albumListSelectedTags.length > 0 ? ` (${albumListSelectedTags.length} selected)` : ''}
              </button>
            </div>
          </aside>

          <main className="main-column">
            {albumListFeedSections.map((section) => (
              <section key={section.key} className="event-section">
                <h2>{section.title} <span className="section-count">{section.albums.length}</span></h2>
                <div className="photo-grid">
                  {section.albums.map((album) => {
                    const cover = photos.find((p) => album.photoIds.includes(p.id))
                    return (
                      <button
                        key={album.id}
                        type="button"
                        className="album-card"
                        onClick={() => openAlbumDetailPage(album.id)}
                      >
                        <div className="album-cover-wrap">
                          {cover ? (
                            <img src={cover.url} alt="" loading="lazy" className="album-cover" />
                          ) : (
                            <div className="album-cover-empty">No photos yet</div>
                          )}
                          <span className="album-count-badge">
                            {album.photoIds.length} {album.photoIds.length === 1 ? 'photo' : 'photos'}
                          </span>
                        </div>
                        <div className="card-body">
                          <h3>{album.name}</h3>
                          <p>
                            <span className="album-meta-badge">{album.isPublic ? 'Public' : 'Private'}</span>
                            {album.collaborators && <> · {album.collaborators}</>}
                          </p>
                          <p>{album.tags.slice(0, 4).join(' · ')}</p>
                        </div>
                      </button>
                    )
                  })}
                  {section.albums.length === 0 && (
                    <EmptyStateBlock
                      title="No albums in this view"
                      detail="Relax the filters or search for a different album name."
                      onReset={resetAlbumListFilters}
                    />
                  )}
                </div>
              </section>
            ))}
          </main>
        </div>
      )}

      {screen === 'album-detail' && activeAlbum && (
        <div className="layout">
          <aside className="sidebar" aria-label="Album filters (apply with button)">
            <div className="album-add-toolbar">
              <p className="toolbar-label">Add photos to this album</p>
              <div className="album-add-buttons">
                <button type="button" className="btn-create btn-wide" onClick={triggerFakeUploadFromDevice}>
                  + Upload New Photo
                </button>
                <button type="button" className="btn-secondary btn-wide" onClick={openSavedPhotosPicker}>
                  {`Add from ${DEMO_ORG_NAME}'s Photos`}
                </button>
              </div>
            </div>
            <div className="filter-panel">
              <button
                type="button"
                className="btn-reset filter-reset-top"
                onClick={() => {
                  setDetailPendingSearch('')
                  setDetailPendingSort('desc')
                  setDetailPendingStart('')
                  setDetailPendingEnd('')
                  setDetailPendingSectionTags([])
                  setDetailShowActivePanel(false)
                  setShowDetailAllTagsModal(false)
                }}
              >
                Reset filters
              </button>

              <div className="search-row">
                <input
                  ref={detailSearchInputRef}
                  className="search-input-full"
                  value={detailPendingSearch}
                  onChange={(event) => setDetailPendingSearch(event.target.value)}
                  placeholder="Search titles, people, memories..."
                  aria-label="Search photos"
                />
              </div>

              <div className="filter-row">
                <label className="filter-inline">
                  <select
                    value={detailPendingSort}
                    onChange={(event) => setDetailPendingSort(event.target.value as SortOrder)}
                  >
                    <option value="desc">Newest first</option>
                    <option value="asc">Oldest first</option>
                  </select>
                </label>
              </div>

              <div className="date-row">
                <label className="date-field">
                  From
                  <input
                    type="date"
                    value={detailPendingStart}
                    onChange={(event) => setDetailPendingStart(event.target.value)}
                  />
                </label>
                <label className="date-field">
                  To
                  <input
                    type="date"
                    value={detailPendingEnd}
                    onChange={(event) => setDetailPendingEnd(event.target.value)}
                  />
                </label>
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDetailShowActivePanel((v) => !v)}
                aria-expanded={detailShowActivePanel}
              >
                {detailShowActivePanel ? '▾ Active tags' : '▸ Active tags'}
              </button>

              {detailShowActivePanel && (
                <div className="active-tags-panel">
                  <p className="panel-hint">Section tags (pending until you filter this album).</p>
                  {detailPendingSectionTags.length === 0 ? (
                    <p className="panel-empty">No section tags. Use View all tags or search.</p>
                  ) : (
                    <ul className="active-tag-chips">
                      {detailPendingSectionTags.map((tag) => (
                        <li key={tag}>
                          <span>{tag}</span>
                          <button
                            type="button"
                            className="chip-remove"
                            onClick={() =>
                              setDetailPendingSectionTags((prev) => prev.filter((t) => t !== tag))
                            }
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <input
                    value={detailTagPicker}
                    onChange={(event) => setDetailTagPicker(event.target.value)}
                    placeholder="Search tags to add…"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && detailPickMatches[0]) {
                        event.preventDefault()
                        addDetailPendingTagIfExists(detailPickMatches[0])
                      }
                    }}
                  />
                  {detailPickMatches.length > 0 && (
                    <div className="suggestion-list">
                      {detailPickMatches.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className="suggestion"
                          onClick={() => addDetailPendingTagIfExists(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button type="button" className="btn-secondary btn-wide" onClick={openDetailAllTagsModal}>
                View all tags
                {detailPendingSectionTags.length > 0
                  ? ` (${detailPendingSectionTags.length} selected)`
                  : ''}
              </button>

              <p className="panel-hint filter-pending-note">
                Filters are staged until you press <strong>Apply filters</strong>. Use{' '}
                <strong>Search from saved photos</strong> above to add images to this album.
              </p>

              <div className="sidebar-action-stack">
                <button type="button" className="btn-wide btn-primary" onClick={applyAlbumDetailFilters}>
                  Apply filters
                </button>
              </div>
            </div>
          </aside>

          <main className="main-column">
            {albumDetailFeedSections.map((section) => (
              <section key={section.key} className="event-section">
                <h2>{section.title} <span className="section-count">{section.photos.length}</span></h2>
                <div className="photo-grid">
                  {section.photos.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      className="photo-card"
                      onClick={() => openPhoto(photo)}
                    >
                      <img src={photo.url} alt={photo.title} loading="lazy" />
                      <div className="card-body">
                        <h3>"{photo.title}"</h3>
                        <p className="card-datetime">{new Date(photo.date).toLocaleString()}</p>
                        <CardOwnerFilter owner={photo.owner} onActivate={applyUploaderFilter} />
                        <p className="card-tags-line">{photo.tags.slice(0, 3).join(' · ')}</p>
                      </div>
                    </button>
                  ))}
                  {section.photos.length === 0 && (
                    <EmptyStateBlock
                      title="Nothing here yet"
                      detail="Clear staged filters or widen dates — or add photos from the library above."
                      onReset={resetDetailFilters}
                    />
                  )}
                </div>
              </section>
            ))}
          </main>
        </div>
      )}

      {activePhoto && (
        <div
          className="lightbox-overlay"
          role="dialog"
          aria-modal="true"
          onClick={closePhoto}
        >
          {/* Close button */}
          <button
            type="button"
            className="lb-close"
            onClick={closePhoto}
            aria-label="Close"
          >
            ×
          </button>

          {/* Counter */}
          <div className="lb-counter">
            {activePhotoIndex + 1} / {lightboxPool.length}
          </div>

          {/* Prev arrow */}
          {hasPrev && (
            <button
              type="button"
              className="lb-arrow lb-prev"
              onClick={(e) => { e.stopPropagation(); navigatePhoto(-1) }}
              aria-label="Previous photo"
            >
              ‹
            </button>
          )}

          {/* Next arrow */}
          {hasNext && (
            <button
              type="button"
              className="lb-arrow lb-next"
              onClick={(e) => { e.stopPropagation(); navigatePhoto(1) }}
              aria-label="Next photo"
            >
              ›
            </button>
          )}

          {/* Main content */}
          <div className="lb-content" onClick={(e) => e.stopPropagation()}>
            <img src={activePhoto.url} alt={activePhoto.title} className="lb-image" />

            <div className="lb-info">
              <div className="lb-info-main">
                <h3 className="lb-title">"{activePhoto.title}"</h3>
                <p className="lb-description">{activePhoto.description}</p>
                <div className="lb-meta">
                  <span className="lb-owner">{activePhoto.owner}</span>
                  <span className="lb-date">{new Date(activePhoto.date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="lb-tags">
                {activePhoto.tags.map((tag) => (
                  <span key={tag} className="tag-chip">
                    {tag}
                    <button
                      type="button"
                      className="tag-chip-remove"
                      aria-label={`Remove tag ${tag}`}
                      onClick={() => removeTagFromActivePhoto(tag)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="lb-toolbar">
                <div className="lb-toolbar-left">
                  <button type="button" className="btn-action" onClick={() => showToast('Added to album (mock).')}>
                    Add to Album
                  </button>
                  <button
                    type="button"
                    className="btn-action"
                    onClick={() => {
                      setAddTagQuery('')
                      setShowAddTagPopup(true)
                    }}
                  >
                    Add Tag
                  </button>
                  <button type="button" className="btn-action" onClick={() => showToast('Share link generated (mock).')}>
                    Share
                  </button>
                  <button type="button" className="btn-action" onClick={() => setShowComments(true)}>
                    Comments
                  </button>
                </div>
                <div className="lb-toolbar-right">
                  <div className="kebab-wrap">
                    <button
                      type="button"
                      className="kebab-btn"
                      onClick={() => setLightboxMenuOpen((o) => !o)}
                      aria-expanded={lightboxMenuOpen}
                      aria-haspopup="menu"
                      aria-label="More options"
                    >
                      ⋮
                    </button>
                    {lightboxMenuOpen && (
                      <ul className="kebab-menu" role="menu">
                        <li role="none">
                          <button type="button" role="menuitem" onClick={() => { showToast('Download started (mock).'); setLightboxMenuOpen(false) }}>
                            Download photo
                          </button>
                        </li>
                        <li role="none">
                          <button type="button" role="menuitem" onClick={() => { showToast('Photo set as cover (mock).'); setLightboxMenuOpen(false) }}>
                            Set as album cover
                          </button>
                        </li>
                        <li role="none">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setLightboxMenuOpen(false)
                              setShowDeletePhotoDialog(true)
                            }}
                          >
                            Delete photo
                          </button>
                        </li>
                        <li role="none">
                          <button type="button" role="menuitem" onClick={() => { showToast('Photo reported (mock).'); setLightboxMenuOpen(false) }}>
                            Report photo
                          </button>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeletePhotoDialog && activePhoto && (
        <div
          className="overlay overlay-narrow"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowDeletePhotoDialog(false)}
        >
          <article className="delete-confirm-card" onClick={(event) => event.stopPropagation()}>
            <h3 className="delete-confirm-title">Remove this photo?</h3>
            <p className="delete-confirm-lead">
              <strong>“{activePhoto.title}”</strong> will disappear from your library in this demo. Nothing is sent to a
              server.
            </p>
            <div className="delete-confirm-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowDeletePhotoDialog(false)}>
                Cancel
              </button>
              <button type="button" className="btn-danger-solid" onClick={confirmDeleteActivePhoto}>
                Delete
              </button>
            </div>
          </article>
        </div>
      )}

      {showAddTagPopup && activePhoto && (
        <div
          className="overlay overlay-narrow"
          role="dialog"
          aria-modal="true"
          aria-label="Add tag"
          onClick={() => setShowAddTagPopup(false)}
        >
          <article className="add-tag-popup" onClick={(event) => event.stopPropagation()}>
            <div className="add-tag-header">
              <h3>Add tag</h3>
              <button type="button" className="lightbox-close" onClick={() => setShowAddTagPopup(false)} aria-label="Close">
                ×
              </button>
            </div>
            <p className="panel-hint">Search existing tags or create a new one.</p>
            <input
              value={addTagQuery}
              onChange={(event) => setAddTagQuery(event.target.value)}
              placeholder="Type to search or name a new tag…"
              autoFocus
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  createAndAddTag()
                }
              }}
            />
            {addTagMatches.length > 0 && (
              <div className="suggestion-list" role="listbox">
                {addTagMatches.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="suggestion"
                    onClick={() => {
                      addTagToActivePhoto(tag)
                      setAddTagQuery('')
                      setShowAddTagPopup(false)
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
            <div className="add-tag-footer">
              <button type="button" onClick={createAndAddTag} disabled={!addTagQuery.trim()}>
                {addTagExact ? `Add “${addTagExact}”` : `Create “${addTagQuery.trim() || '…'}”`}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowAddTagPopup(false)}>
                Cancel
              </button>
            </div>
          </article>
        </div>
      )}

      {showAllTagsModal && (
        <div
          className="overlay overlay-narrow"
          role="dialog"
          aria-modal="true"
          aria-label="Choose section tags"
          onClick={() => setShowAllTagsModal(false)}
        >
          <article className="all-tags-modal" onClick={(event) => event.stopPropagation()}>
            <div className="add-tag-header">
              <h3>All tags</h3>
              <button type="button" className="lightbox-close" aria-label="Close" onClick={() => setShowAllTagsModal(false)}>
                ×
              </button>
            </div>
            <p className="panel-hint">Select or clear tags, then confirm to update your sections.</p>
            <input
              value={allTagsModalSearch}
              onChange={(event) => setAllTagsModalSearch(event.target.value)}
              placeholder="Filter this list…"
              aria-label="Filter tags in modal"
            />
            <div className="all-tags-grid" role="group" aria-label="Tags">
              {modalTagsFiltered.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={allTagsModalDraft.includes(tag) ? 'tag active' : 'tag'}
                  onClick={() => toggleDraftTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="add-tag-footer">
              <button type="button" onClick={confirmAllTagsModal}>
                Confirm
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowAllTagsModal(false)}>
                Cancel
              </button>
            </div>
          </article>
        </div>
      )}

      {showUploadModal && (
        <div
          className="overlay overlay-narrow upload-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Upload photo"
          onClick={closeUploadModal}
        >
          <article className="upload-modal" onClick={(event) => event.stopPropagation()}>
            <div className="upload-modal-hero">
              <div className="upload-modal-hero-top">
                <div className="upload-modal-hero-brand">
                  <img
                    className="upload-modal-hero-icon"
                    src={`${import.meta.env.BASE_URL}PhotoTag.png`}
                    alt=""
                    width={36}
                    height={36}
                  />
                  <div>
                    <h3 className="upload-modal-title">Add to library</h3>
                    <p className="upload-modal-subtitle">Photos appear under your name in the org catalog</p>
                  </div>
                </div>
                <button type="button" className="lightbox-close" aria-label="Close" onClick={closeUploadModal}>
                  ×
                </button>
              </div>

              <ol className="upload-modal-steps" aria-label="Upload steps">
                <li
                  className={`upload-modal-step${
                    uploadPickUrl || uploadInFlight ? ' upload-modal-step--complete' : ' upload-modal-step--active'
                  }`}
                >
                  <span className="upload-modal-step-num">1</span>
                  <span className="upload-modal-step-label">File</span>
                </li>
                <li className="upload-modal-step-connector" aria-hidden="true" />
                <li
                  className={`upload-modal-step${
                    uploadInFlight ? ' upload-modal-step--complete' : ''
                  }${uploadPickUrl && !uploadInFlight ? ' upload-modal-step--active' : ''}${
                    !uploadPickUrl ? ' upload-modal-step--muted' : ''
                  }`}
                >
                  <span className="upload-modal-step-num">2</span>
                  <span className="upload-modal-step-label">Details</span>
                </li>
                <li className="upload-modal-step-connector" aria-hidden="true" />
                <li
                  className={`upload-modal-step${uploadInFlight ? ' upload-modal-step--active' : ''}${
                    !uploadPickUrl ? ' upload-modal-step--muted' : ''
                  }${uploadPickUrl && !uploadInFlight ? ' upload-modal-step--next' : ''}`}
                >
                  <span className="upload-modal-step-num">3</span>
                  <span className="upload-modal-step-label">Send</span>
                </li>
              </ol>
            </div>

            <div className="upload-modal-uploader">
              <img className="app-top-nav-avatar" src={avatarPhotoUrl} alt="" width={40} height={40} />
              <div className="upload-modal-who">
                <div className="upload-modal-who-row">
                  <span className="upload-modal-name">{DEMO_USER_DISPLAY_NAME}</span>
                  <span className="upload-modal-badge">Uploader</span>
                </div>
                <span className="upload-modal-org">{DEMO_ORG_NAME}</span>
                <p className="upload-modal-hint">
                  {screen === 'album-detail' && activeAlbum ? (
                    <>
                      Destination: <strong>{activeAlbum.name}</strong> album + org-wide search. Visibility follows
                      album rules (demo).
                    </>
                  ) : (
                    <>
                      Shared with <strong>{DEMO_ORG_NAME}</strong> teammates. New photos default to tags{' '}
                      <strong>Office</strong> &amp; <strong>Misc</strong> — edit anytime after upload.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="upload-modal-facts" role="list">
              <div className="upload-modal-fact" role="listitem">
                <span className="upload-modal-fact-k">Attribution</span>
                <span className="upload-modal-fact-v">{DEMO_USER_DISPLAY_NAME}</span>
              </div>
              <div className="upload-modal-fact" role="listitem">
                <span className="upload-modal-fact-k">Workspace</span>
                <span className="upload-modal-fact-v">{DEMO_ORG_NAME}</span>
              </div>
              <div className="upload-modal-fact" role="listitem">
                <span className="upload-modal-fact-k">Album</span>
                <span className="upload-modal-fact-v">
                  {screen === 'album-detail' && activeAlbum ? activeAlbum.name : 'Library only'}
                </span>
              </div>
            </div>

            <input
              ref={uploadFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="upload-modal-file-input"
              onChange={onUploadFileChosen}
              aria-label="Choose image file"
            />

            {!uploadPickUrl ? (
              <div
                className={`upload-modal-dropzone${uploadDragActive ? ' upload-modal-dropzone--active' : ''}`}
                onDrop={onUploadDrop}
                onDragOver={onUploadDragOver}
                onDragEnter={onUploadDragOver}
                onDragLeave={onUploadDragLeave}
              >
                <div className="upload-modal-dropzone-icon" aria-hidden="true">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 4v12m0 0l4-4m-4 4l-4-4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="upload-modal-dropzone-title">Drop an image here</p>
                <p className="upload-modal-dropzone-text">
                  or browse from your computer — we&apos;ll generate a preview before anything is saved.
                </p>
                <ul className="upload-modal-formats">
                  <li>JPEG, PNG, GIF, WebP</li>
                  <li>Max 25 MB (demo limit)</li>
                  <li>Stays in this browser session only</li>
                </ul>
                <button
                  type="button"
                  className="btn-create upload-modal-browse-btn"
                  onClick={() => uploadFileInputRef.current?.click()}
                >
                  Browse files…
                </button>
              </div>
            ) : (
              <div className="upload-modal-editor">
                <div className="upload-modal-file-strip">
                  <div className="upload-modal-file-meta">
                    <span className="upload-modal-file-name" title={uploadFileMeta?.name}>
                      {uploadFileMeta?.name ?? 'Image'}
                    </span>
                    {uploadFileMeta && (
                      <span className="upload-modal-file-size">{formatFileSize(uploadFileMeta.size)}</span>
                    )}
                  </div>
                  {!uploadInFlight && (
                    <button
                      type="button"
                      className="btn-secondary upload-modal-replace-btn"
                      onClick={() => uploadFileInputRef.current?.click()}
                    >
                      Replace
                    </button>
                  )}
                </div>
                <div className="upload-modal-preview">
                  <img src={uploadPickUrl} alt="" />
                </div>
                <div className="upload-modal-fields">
                  <label className="form-field">
                    Title
                    <input
                      value={uploadTitle}
                      onChange={(event) => setUploadTitle(event.target.value)}
                      placeholder="Give this photo a clear title"
                      disabled={uploadInFlight}
                    />
                  </label>
                  <label className="form-field">
                    Description <span className="upload-modal-optional">optional</span>
                    <textarea
                      value={uploadDescription}
                      onChange={(event) => setUploadDescription(event.target.value)}
                      placeholder="Context for teammates — event, location, who should see it…"
                      rows={3}
                      disabled={uploadInFlight}
                    />
                  </label>
                </div>
                {uploadInFlight && (
                  <div className="upload-modal-progress" aria-live="polite">
                    <div className="upload-modal-progress-head">
                      <span className="upload-modal-progress-label">Sending to {DEMO_ORG_NAME}…</span>
                      <span className="upload-modal-progress-pct">{uploadProgress}%</span>
                    </div>
                    <div
                      className="upload-modal-progress-bar"
                      role="progressbar"
                      aria-valuenow={uploadProgress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div className="upload-modal-progress-fill" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="upload-modal-progress-hint">Encrypting preview · scanning metadata (simulated)</p>
                  </div>
                )}
              </div>
            )}

            <p className="upload-modal-demo-strip">
              <strong>Demo mode:</strong> no server upload — the image never leaves your tab. Perfect for screenshots
              in class.
            </p>

            <div className="add-tag-footer upload-modal-footer">
              <div className="upload-modal-footer-left">
                <button type="button" className="btn-secondary" onClick={closeUploadModal} disabled={uploadInFlight}>
                  Cancel
                </button>
              </div>
              <div className="upload-modal-footer-right">
                <button
                  type="button"
                  className="btn-create upload-modal-primary-btn"
                  onClick={startDemoUpload}
                  disabled={!uploadPickUrl || uploadInFlight}
                >
                  {uploadInFlight ? (
                    <>
                      <span className="upload-modal-btn-spinner" aria-hidden="true" />
                      Uploading…
                    </>
                  ) : (
                    <>Upload to {DEMO_ORG_NAME}</>
                  )}
                </button>
              </div>
            </div>
          </article>
        </div>
      )}

      {showCreateAlbumModal && (
        <div
          className="overlay overlay-narrow"
          role="dialog"
          aria-modal="true"
          aria-label="Create album"
          onClick={() => setShowCreateAlbumModal(false)}
        >
          <article className="create-album-modal" onClick={(event) => event.stopPropagation()}>
            <div className="add-tag-header">
              <h3>Create album</h3>
              <button
                type="button"
                className="lightbox-close"
                aria-label="Close"
                onClick={() => setShowCreateAlbumModal(false)}
              >
                ×
              </button>
            </div>
            <label className="form-field">
              Name of album
              <input
                value={createAlbumName}
                onChange={(event) => setCreateAlbumName(event.target.value)}
                placeholder="Summer reunion 2026"
                autoFocus
              />
            </label>
            <fieldset className="form-field visibility-fieldset">
              <legend>Private or public</legend>
              <label className="radio-line">
                <input
                  type="radio"
                  name="album-visibility"
                  checked={!createAlbumPublic}
                  onChange={() => setCreateAlbumPublic(false)}
                />
                Private
              </label>
              <label className="radio-line">
                <input
                  type="radio"
                  name="album-visibility"
                  checked={createAlbumPublic}
                  onChange={() => setCreateAlbumPublic(true)}
                />
                Public (anyone with a link can add photos)
              </label>
            </fieldset>
            <label className="form-field">
              Collaborators to add
              <input
                value={createAlbumCollaborators}
                onChange={(event) => setCreateAlbumCollaborators(event.target.value)}
                placeholder="name@email.com, teammate…"
              />
            </label>
            <p className="panel-hint">Tags on this album</p>
            <input
              value={createAlbumTagsSearch}
              onChange={(event) => setCreateAlbumTagsSearch(event.target.value)}
              placeholder="Filter tag list…"
            />
            <div className="all-tags-grid" role="group" aria-label="Album tags">
              {createAlbumTagsFiltered.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={createAlbumTagsDraft.includes(tag) ? 'tag active' : 'tag'}
                  onClick={() => toggleCreateAlbumTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="add-tag-footer">
              <button type="button" onClick={submitCreateAlbum}>
                Create
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowCreateAlbumModal(false)}>
                Cancel
              </button>
            </div>
          </article>
        </div>
      )}

      {showAlbumListAllTagsModal && (
        <div
          className="overlay overlay-narrow"
          role="dialog"
          aria-modal="true"
          aria-label="Album list tags"
          onClick={() => setShowAlbumListAllTagsModal(false)}
        >
          <article className="all-tags-modal" onClick={(event) => event.stopPropagation()}>
            <div className="add-tag-header">
              <h3>All tags</h3>
              <button
                type="button"
                className="lightbox-close"
                aria-label="Close"
                onClick={() => setShowAlbumListAllTagsModal(false)}
              >
                ×
              </button>
            </div>
            <p className="panel-hint">Choose section tags for the album list, then confirm.</p>
            <input
              value={albumListTagsModalSearch}
              onChange={(event) => setAlbumListTagsModalSearch(event.target.value)}
              placeholder="Filter this list…"
            />
            <div className="all-tags-grid" role="group">
              {albumListModalTagsFiltered.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={albumListTagsModalDraft.includes(tag) ? 'tag active' : 'tag'}
                  onClick={() => toggleAlbumListModalTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="add-tag-footer">
              <button type="button" onClick={confirmAlbumListTagsModal}>
                Confirm
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAlbumListAllTagsModal(false)}
              >
                Cancel
              </button>
            </div>
          </article>
        </div>
      )}

      {showDetailAllTagsModal && (
        <div
          className="overlay overlay-narrow"
          role="dialog"
          aria-modal="true"
          aria-label="Album section tags"
          onClick={() => setShowDetailAllTagsModal(false)}
        >
          <article className="all-tags-modal" onClick={(event) => event.stopPropagation()}>
            <div className="add-tag-header">
              <h3>All tags</h3>
              <button
                type="button"
                className="lightbox-close"
                aria-label="Close"
                onClick={() => setShowDetailAllTagsModal(false)}
              >
                ×
              </button>
            </div>
            <p className="panel-hint">Tags for album sections (pending until you filter this album).</p>
            <input
              value={detailTagsModalSearch}
              onChange={(event) => setDetailTagsModalSearch(event.target.value)}
              placeholder="Filter this list…"
            />
            <div className="all-tags-grid" role="group">
              {detailTagsModalFiltered.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={detailTagsModalDraft.includes(tag) ? 'tag active' : 'tag'}
                  onClick={() => toggleDetailTagsModalTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="add-tag-footer">
              <button type="button" onClick={confirmDetailTagsModal}>
                Confirm
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowDetailAllTagsModal(false)}>
                Cancel
              </button>
            </div>
          </article>
        </div>
      )}

      {showAddToAlbumModal && activeAlbum && (
        <div
          className="overlay add-photos-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Add photos to album"
          onClick={closeSavedPhotosPicker}
        >
          <article className="add-photos-modal" onClick={(event) => event.stopPropagation()}>
            <div className="add-tag-header">
              <h3>Add photos to “{activeAlbum.name}”</h3>
              <button
                type="button"
                className="lightbox-close"
                aria-label="Close"
                onClick={closeSavedPhotosPicker}
              >
                ×
              </button>
            </div>
            <p className="panel-hint">
              This picker reuses the Photos-style sidebar search and filters. Click a photo to add it.
            </p>

            <div className="layout">
              <aside className="sidebar" aria-label="Saved photo filters">
                <div className="filter-panel">
                  <button
                    type="button"
                    className="btn-reset filter-reset-top"
                    onClick={() => {
                      setSelectedTags([])
                      setSearchQuery('')
                      setSortOrder('desc')
                      setStartDate('')
                      setEndDate('')
                      setShowActiveTagsPanel(false)
                      setShowAllTagsModal(false)
                    }}
                  >
                    Reset filters
                  </button>

                  <div className="search-row">
                    <input
                      ref={savedPickerSearchInputRef}
                      className="search-input-full"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search titles, people, memories..."
                      aria-label="Search photos"
                    />
                  </div>

                  <div className="controls-column">
                    <label>
                      Sort
                      <select
                        value={sortOrder}
                        onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                      >
                        <option value="desc">Newest first</option>
                        <option value="asc">Oldest first</option>
                      </select>
                    </label>

                    <label>
                      Start
                      <input
                        type="date"
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                      />
                    </label>

                    <label>
                      End
                      <input
                        type="date"
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowActiveTagsPanel((v) => !v)}
                    aria-expanded={showActiveTagsPanel}
                  >
                    {showActiveTagsPanel ? '▾ Active tags' : '▸ Active tags'}
                  </button>

                  {showActiveTagsPanel && (
                    <div className="active-tags-panel">
                      <p className="panel-hint">
                        These tags control which sections appear.
                      </p>
                      {selectedTags.length === 0 ? (
                        <p className="panel-empty">No section tags. Use View all tags or search.</p>
                      ) : (
                        <ul className="active-tag-chips">
                          {selectedTags.map((tag) => (
                            <li key={tag}>
                              <span>{tag}</span>
                              <button
                                type="button"
                                className="chip-remove"
                                aria-label={`Remove ${tag} from active tags`}
                                onClick={() => setSelectedTags((prev) => prev.filter((t) => t !== tag))}
                              >
                                ×
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}

                      <label className="sr-only" htmlFor="saved-active-tag-search">
                        Search tags to add to filter
                      </label>
                      <input
                        id="saved-active-tag-search"
                        value={activeTagPickerQuery}
                        onChange={(event) => setActiveTagPickerQuery(event.target.value)}
                        placeholder="Search library tags to add…"
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && pickMatches[0]) {
                            event.preventDefault()
                            addFilterTagIfExists(pickMatches[0])
                          }
                        }}
                      />
                      {pickMatches.length > 0 && (
                        <div className="suggestion-list" role="listbox">
                          {pickMatches.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              className="suggestion"
                              onClick={() => addFilterTagIfExists(tag)}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    className="btn-secondary btn-wide"
                    onClick={openAllTagsModal}
                  >
                    View all tags
                    {selectedTags.length > 0 ? ` (${selectedTags.length} selected)` : ''}
                  </button>
                </div>
              </aside>

              <main className="main-column">
                {savedPickerFeedSections.map((section) => (
                  <section key={section.key} className="event-section">
                    <h2>{section.title} <span className="section-count">{section.photos.length}</span></h2>
                    <div className="photo-grid">
                      {section.photos.map((photo) => (
                        <button
                          key={photo.id}
                          type="button"
                          className="photo-card"
                          onClick={() => addPhotoToAlbum(photo)}
                        >
                          <img src={photo.url} alt={photo.title} loading="lazy" />
                          <div className="card-body">
                            <h3>"{photo.title}"</h3>
                            <CardOwnerFilter owner={photo.owner} onActivate={applyUploaderFilter} />
                            <p className="card-tags-line">{photo.tags.slice(0, 3).join(' · ')}</p>
                          </div>
                        </button>
                      ))}
                      {section.photos.length === 0 && (
                        <EmptyStateBlock
                          title="Nothing to pick from"
                          detail="Soften the filters to see more photos from the library."
                          onReset={resetPhotosFilters}
                        />
                      )}
                    </div>
                  </section>
                ))}
              </main>
            </div>
          </article>
        </div>
      )}

      {showComments && activePhoto && (
        <div className="overlay" role="dialog" aria-modal="true">
          <article className="comment-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Comments for {activePhoto.title}</h3>
            <div className="comments-list">
              <p>
                <strong>Allan:</strong> Positive comments only in this mock app.
              </p>
              <p>
                <strong>Kevin:</strong> This memory should be pinned.
              </p>
            </div>
            <textarea
              placeholder="Write a comment..."
              value={commentDraft}
              onChange={(event) => setCommentDraft(event.target.value)}
            />
            <div className="action-row">
              <button
                type="button"
                onClick={() => {
                  const trimmed = commentDraft.trim()
                  if (!trimmed) return
                  showToast(`Comment posted: "${trimmed}"`)
                  setCommentDraft('')
                }}
              >
                Post comment
              </button>
              <button type="button" onClick={() => setShowComments(false)}>
                Close
              </button>
            </div>
          </article>
        </div>
      )}

      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
