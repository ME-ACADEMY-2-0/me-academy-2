import Link from "next/link";
import { BookOpen, Star } from "lucide-react";
import { Cover } from "@/components/dash/ui";
import { defaultAvatar } from "@/lib/avatars";
import { formatPrice } from "@/lib/format";
import type { CourseCard } from "@/lib/data/learn";

// Course cards for signed-out pages. Each opens the public course page, where visitors enroll or buy.
export function PublicCourseGrid({ courses }: { courses: CourseCard[] }) {
  return (
    <div className="et-course-grid">
      {courses.map((c) => (
        <article key={c.id} className="et-card et-course et-ccard">
          <Link href={`/courses/${c.slug}`} className="et-ccard-link" aria-label={`View ${c.title}`} />
          <div className="et-ccard-media">
            <Cover url={c.coverUrl} />
            <span className="et-ccard-level">{c.level}</span>
          </div>
          <div className="et-ccard-body">
            {c.category && <p className="et-ccard-eyebrow">{c.category}</p>}
            <h3>{c.title}</h3>
            <p className="et-ccard-by">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={defaultAvatar(c.instructor)} alt="" className="et-ccard-avatar" />
              {c.instructor}
            </p>
            <p className="et-ccard-meta">
              <span>
                <BookOpen size={13} /> {c.lessonCount} {c.lessonCount === 1 ? "lesson" : "lessons"}
              </span>
              {c.rating ? (
                <span className="et-ccard-rating">
                  <Star size={13} fill="currentColor" /> {c.rating.toFixed(1)} <small>({c.reviews})</small>
                </span>
              ) : null}
            </p>
          </div>
          <div className="et-ccard-foot">
            {c.priceMinor === 0 ? <span className="et-ccard-free">Free</span> : <b className="et-ccard-price">{formatPrice(c.priceMinor, c.currency)}</b>}
            <span className="et-btn et-btn-primary et-btn-sm">View course</span>
          </div>
        </article>
      ))}
    </div>
  );
}
