import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

type SortOrder = 'desc' | 'asc'
type EventType = 'Wedding' | 'Graduation' | 'Family Reunion'

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
  'Wedding',
  'Graduation',
  'Family Reunion',
  'Bride',
  'Groom',
  'Wedding cake',
  'Well wishes',
  'Decorations',
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
]

const initialPhotos: Photo[] = [
  {
    id: 'w-001',
    title: 'Under the veil',
    event: 'Wedding',
    date: '2026-03-21T20:15:00',
    owner: 'Luke Hymas',
    album: 'Wedding Highlights',
    tags: ['Wedding', 'Bride', 'Groom', 'Dancing', 'Laughter'],
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    description: 'Sneaking a quiet moment together before the reception.',
  },
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
    album: null,
    tags: ['Family Reunion', 'Grandparents', 'Stories', 'Memories', 'Family photos'],
    url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
    description: 'Everyone together for golden hour on the last night.',
  },
  {
    id: 'w-002',
    title: 'Golden hour newlyweds',
    event: 'Wedding',
    date: '2026-03-21T21:05:00',
    owner: 'Luke Hymas',
    album: 'Wedding Highlights',
    tags: ['Wedding', 'Wedding cake', 'Well wishes', 'People laughing'],
    url: 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?auto=format&fit=crop&w=1200&q=80',
    description: 'Walking together right as the sun dipped behind the trees.',
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
]

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
    return [{ key: 'all', title: 'All photos', photos }]
  }
  return selectedTags.map((tag) => ({
    key: tag,
    title: tag,
    photos: photos.filter((photo) => photoHasTag(photo, tag)),
  }))
}

function buildAlbumFeedSections(albums: Album[], selectedTags: string[]) {
  if (selectedTags.length === 0) {
    return [{ key: 'all', title: 'All albums', albums }]
  }
  return selectedTags.map((tag) => ({
    key: tag,
    title: tag,
    albums: albums.filter((a) => a.tags.includes(tag)),
  }))
}

const initialAlbums: Album[] = [
  {
    id: 'album-wedding',
    name: 'Wedding Highlights',
    isPublic: false,
    collaborators: 'Luke Hymas, Allan Evans',
    tags: ['Wedding', 'Bride'],
    photoIds: ['w-001', 'w-002'],
  },
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
    photoIds: ['f-002'],
  },
]

function App() {
  const [screen, setScreen] = useState<AppScreen>('photos')
  const [albums, setAlbums] = useState<Album[]>(initialAlbums)
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null)
  const nextAlbumIdRef = useRef(100)

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

  const knownTags = useMemo(
    () => mergeUniqueTags([seedTags, ...photos.map((p) => p.tags)]),
    [photos],
  )

  const openPhoto = (photo: Photo) => {
    setLightboxMenuOpen(false)
    setActivePhoto(photo)
  }

  const closePhoto = () => {
    setLightboxMenuOpen(false)
    setActivePhoto(null)
  }

  const showToast = (message: string) => {
    const id = ++toastIdRef.current
    setToasts((prev) => [...prev, { id, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 2800)
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
    if (!activePhoto) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigatePhoto(-1)
      else if (e.key === 'ArrowRight') navigatePhoto(1)
      else if (e.key === 'Escape') closePhoto()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activePhoto, navigatePhoto])

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

  const closeSavedPhotosPicker = () => {
    setShowAddToAlbumModal(false)
  }

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

  const triggerFakeUploadFromDevice = () => {
    showToast('Upload from device (mock—no file picker).')
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

  const deleteActivePhoto = () => {
    if (!activePhoto) return
    setPhotos((prev) => prev.filter((photo) => photo.id !== activePhoto.id))
    showToast(`"${activePhoto.title}" deleted.`)
    closePhoto()
  }

  return (
    <div className="app">
      <header className="page-header page-header-bar">
        <div className="page-header-text">
          <p className="app-brand">PhotoSort</p>
          <h1>
            {screen === 'photos' && 'My Photos'}
            {screen === 'albums' && 'My Albums'}
            {screen === 'album-detail' && activeAlbum && activeAlbum.name}
          </h1>
          <div className="header-description">
            <p>
            {screen === 'photos' &&
              'Browse and filter your photos. Use tags to organize the feed into sections — each tag becomes its own group.'}
            {screen === 'albums' && 'Your albums, organized by tags. Click an album to view or add photos.'}
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
            My Photos
          </button>
          <button
            type="button"
            className={screen === 'albums' || screen === 'album-detail' ? 'tab-btn tab-active' : 'tab-btn'}
            onClick={goToAlbumsList}
            aria-current={screen === 'albums' || screen === 'album-detail' ? 'page' : undefined}
          >
            My Albums
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
            My Albums
          </button>
          <span className="breadcrumb-sep" aria-hidden="true">›</span>
          <span className="breadcrumb-current" aria-current="page">{activeAlbum.name}</span>
        </nav>
      )}

      {screen === 'photos' && (
      <div className="layout">
        <aside className="sidebar" aria-label="Filters and tag search">
          <div className="filter-panel">
            <div className="search-row">
              <input
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

            <button
              type="button"
              className="btn-reset"
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
                      <p className="card-owner">{photo.owner}</p>
                      <p className="card-date">{new Date(photo.date).toLocaleDateString()}</p>
                    </div>
                  </button>
                ))}
                {section.photos.length === 0 && (
                  <p className="empty-state">No photos match your current filters. Try broadening your search or removing some tags.</p>
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

              <button
                type="button"
                className="btn-reset"
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
                    <p className="empty-state">No albums match your current filters. Try a different search or create a new album.</p>
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
                  Add from My Photos
                </button>
              </div>
            </div>
            <div className="filter-panel">
              <div className="search-row">
                <input
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

              <button
                type="button"
                className="btn-reset"
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
                        <p>
                          {new Date(photo.date).toLocaleString()} — {photo.owner}
                        </p>
                        <p>{photo.tags.slice(0, 3).join(' · ')}</p>
                      </div>
                    </button>
                  ))}
                  {section.photos.length === 0 && (
                    <p className="empty-state">No photos match your current filters. Try broadening your search or removing some tags.</p>
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
                          <button type="button" role="menuitem" onClick={deleteActivePhoto}>
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
                  <div className="search-row">
                    <input
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

                  <button
                    type="button"
                    className="btn-reset"
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
                            <p>{photo.tags.slice(0, 3).join(' · ')}</p>
                          </div>
                        </button>
                      ))}
                      {section.photos.length === 0 && (
                        <p className="empty-state">No photos match your current filters. Try broadening your search or removing some tags.</p>
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
