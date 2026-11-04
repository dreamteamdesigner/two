import React, { useMemo, useState } from "react";

import galleryData from "../../data/gallery.json";

import {
  IconPhotoVideo,
  IconVideo,
  IconPhoto,
  IconDatabase,
} from "@tabler/icons-react";

import DataCard from "../../components/DataCard";

const Gallery = () => {
  const gallery = galleryData.gallery ?? [];

  const [activeFilter, setActiveFilter] = useState("All media");

  // Calculate gallery statistics.
  const galleryStats = useMemo(() => {
    const videos = gallery.filter(
      (media) => media.type?.toLowerCase() === "video",
    );

    const photos = gallery.filter(
      (media) => media.type?.toLowerCase() === "photo",
    );

    const totalStorage = gallery.reduce(
      (total, media) => total + (Number(media.size_mb) || 0),
      0,
    );

    const favorites = gallery.filter((media) => media.is_favorite).length;

    return {
      total: gallery.length,
      videos: videos.length,
      photos: photos.length,
      storage: totalStorage,
      favorites,
    };
  }, [gallery]);

  // Format storage size.
  const formatStorage = (size) => {
    if (size >= 1024) {
      return `${(size / 1024).toFixed(2)} GB`;
    }

    return `${size.toFixed(1)} MB`;
  };

  const galleryWidgets = [
    {
      icon: <IconPhotoVideo size={16} />,
      title: "Total items",
      value: galleryStats.total.toLocaleString(),
      change: `${galleryStats.favorites} favorites`,
    },
    {
      icon: <IconVideo size={16} />,
      title: "Videos",
      value: galleryStats.videos.toLocaleString(),
      change: "Video files",
    },
    {
      icon: <IconPhoto size={16} />,
      title: "Images",
      value: galleryStats.photos.toLocaleString(),
      change: "Photo files",
    },
    {
      icon: <IconDatabase size={16} />,
      title: "Storage used",
      value: formatStorage(galleryStats.storage),
      change: "Combined media size",
    },
  ];

  // Format dates using the timezone represented by the dataset.
  const TIME_ZONE = "America/New_York";

  const getDateKey = (date) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);

    const values = Object.fromEntries(
      parts.map(({ type, value }) => [type, value]),
    );

    return `${values.year}-${values.month}-${values.day}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Unknown date";
    }

    const now = new Date();

    const todayKey = getDateKey(now);
    const targetKey = getDateKey(date);

    const today = new Date(`${todayKey}T00:00:00Z`);
    const targetDay = new Date(`${targetKey}T00:00:00Z`);

    const diffDays = Math.round((today - targetDay) / (1000 * 60 * 60 * 24));

    const time = date.toLocaleTimeString("en-US", {
      timeZone: TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    if (diffDays === 0) {
      return `Today, ${time}`;
    }

    if (diffDays === 1) {
      return `Yesterday, ${time}`;
    }

    if (diffDays === 2) {
      return `${date.toLocaleDateString("en-US", {
        timeZone: TIME_ZONE,
        weekday: "long",
      })}, ${time}`;
    }

    return date.toLocaleDateString("en-US", {
      timeZone: TIME_ZONE,
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Filter gallery by selected media type.
  const filteredGallery = useMemo(() => {
    if (activeFilter === "Photos") {
      return gallery.filter((media) => media.type?.toLowerCase() === "photo");
    }

    if (activeFilter === "Videos") {
      return gallery.filter((media) => media.type?.toLowerCase() === "video");
    }

    return gallery;
  }, [gallery, activeFilter]);

  const filters = ["All media", "Photos", "Videos"];

  return (
    <>
      {/* Overview */}
      <section>
        <div className="header">
          <div className="heads">
            <span>Overview</span>
          </div>
        </div>

        <div className="row data">
          {galleryWidgets.map((widget) => (
            <DataCard key={widget.title} {...widget} />
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section>
        <div className="header">
          <div className="heads">
            <span>Gallery</span>

            <div className="timeline">
              {filters.map((filter) => (
                <button
                  type="button"
                  key={filter}
                  className={activeFilter === filter ? "active" : ""}
                  aria-pressed={activeFilter === filter}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="row">
          <div className="gallery-widget">
            {filteredGallery.length > 0 ? (
              filteredGallery.map((media) => {
                const isVideo = media.type?.toLowerCase() === "video";

                return (
                  <div key={media.id}>
                    <div className="image">
                      {media.thumbnail ? (
                        <img
                          src={media.thumbnail}
                          alt={media.filename}
                          loading="lazy"
                        />
                      ) : (
                        <div className="gallery-placeholder">
                          {isVideo ? (
                            <IconVideo size={16} />
                          ) : (
                            <IconPhoto size={16} />
                          )}
                        </div>
                      )}

                      {isVideo && (
                        <span className="media-type">
                          {/* <IconVideo size={13} /> */}
                        </span>
                      )}
                    </div>

                    <div className="info">
                      <span>{media.filename}</span>

                      <p>Saved from {media.source}</p>

                      <p>{formatDate(media.created_at)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="gallery-empty">
                No {activeFilter.toLowerCase()} found.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Gallery;
