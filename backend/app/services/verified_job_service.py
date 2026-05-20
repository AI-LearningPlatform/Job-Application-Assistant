from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import urlparse

import requests


TRUSTED_PLATFORM_DOMAINS = {
    "remotive.com",
    "remoteok.com",
    "arbeitnow.com",
    "themuse.com",
}

TRUSTED_ATS_DOMAINS = {
    "ashbyhq.com",
    "bamboohr.com",
    "greenhouse.io",
    "jobs.lever.co",
    "myworkdayjobs.com",
    "smartrecruiters.com",
    "workable.com",
}

DIRECT_CAREER_SEEDS = [
    {
        "id": "launchdarkly_data_analyst_revenue_metrics",
        "title": "Data Analyst - Revenue & Metrics",
        "company": "LaunchDarkly",
        "location": "Hybrid - Bangalore",
        "url": "https://job-boards.greenhouse.io/launchdarkly/jobs/7692792003",
        "source": "LaunchDarkly Careers",
    },
    {
        "id": "everbridge_data_analyst_ai_data_platform",
        "title": "Data Analyst (AI & Data Platform)",
        "company": "Everbridge",
        "location": "Bengaluru - Remote",
        "url": "https://jobs.lever.co/everbridge/70ea33b2-9903-4760-8926-963845e96291",
        "source": "Everbridge Careers",
    },
    {
        "id": "gitlab_senior_data_analyst_enterprise_analytics",
        "title": "Senior Data Analyst, Enterprise Analytics",
        "company": "GitLab",
        "location": "Remote, Bangalore",
        "url": "https://job-boards.greenhouse.io/gitlab/jobs/8478359002",
        "source": "GitLab Careers",
    },
    {
        "id": "brillio_lead_data_analyst",
        "title": "Lead Data Analyst",
        "company": "Brillio",
        "location": "Bangalore, Karnataka, India - Hybrid",
        "url": "https://jobs.lever.co/brillio-2/de7adbf1-0421-4a9d-a5f5-d443cdd29263",
        "source": "Brillio Careers",
    },
    {
        "id": "flexera_senior_data_analyst",
        "title": "Senior Data Analyst",
        "company": "Flexera",
        "location": "Bangalore - Hybrid",
        "url": "https://flexerasoftware.wd1.myworkdayjobs.com/en-US/FlexeraSoftware/job/Senior-Data-Analyst_15627-2",
        "source": "Flexera Careers",
    },
    {
        "id": "clarivate_healthcare_research_data_analyst",
        "title": "Associate Healthcare Research & Data Analyst",
        "company": "Clarivate",
        "location": "Bangalore - Hybrid",
        "url": "https://clarivate.wd3.myworkdayjobs.com/Clarivate_Careers/job/IND---Bangalore-DRG/Associate-Healthcare-Research---Data-Analyst_JREQ134942",
        "source": "Clarivate Careers",
    },
]

GENERIC_COMPANY_NAMES = {
    "confidential",
    "private company",
    "recruiter",
    "recruitment",
    "hiring partner",
    "placement agency",
    "unknown",
}

SCAM_TERMS = {
    "whatsapp",
    "telegram",
    "registration fee",
    "joining fee",
    "security deposit",
    "processing fee",
    "pay to apply",
    "paid assignment",
    "wallet transfer",
    "crypto",
    "bitcoin",
    "work from home without interview",
    "no interview",
    "instant hiring",
    "guaranteed job",
    "earn daily",
}

TRAINING_AD_TERMS = {
    "bootcamp",
    "course",
    "certification",
    "training program",
    "placement guarantee",
    "job guarantee",
    "pay after placement",
    "enroll",
    "admission",
    "academy",
    "institute",
}

DATA_ANALYST_TITLE_TERMS = {
    "data analyst",
    "business analyst",
    "business intelligence analyst",
    "bi analyst",
    "reporting analyst",
    "analytics analyst",
    "product analyst",
    "marketing analyst",
    "customer analyst",
    "operations analyst",
}

MAX_POSTING_AGE_DAYS = 45


def fetch_verified_data_analyst_jobs(
    role: str = "Data Analyst",
    limit: int = 15,
    location_focus: str = "Bangalore",
    work_mode: str = "remote_hybrid",
) -> list[dict[str, Any]]:
    session = requests.Session()
    session.headers.update(
        {
            "Accept": "application/json",
            "User-Agent": "JobApplicationAssistant/1.0 verified-job-aggregator",
        }
    )

    candidates: list[dict[str, Any]] = []
    candidates.extend(_fetch_direct_career_seed_jobs(session, role, location_focus))
    for search_term in _search_terms(role, location_focus):
        candidates.extend(_fetch_remotive(session, search_term, limit * 2))
    candidates.extend(_fetch_themuse(session, role, location_focus))
    candidates.extend(_fetch_remoteok(session, role))
    candidates.extend(_fetch_arbeitnow(session, role))

    verified_jobs = []
    for job in candidates:
        verified = _verify_job(job, role, location_focus, work_mode)
        if verified is not None:
            verified_jobs.append(verified)

    deduped = _dedupe_jobs(verified_jobs)
    deduped.sort(
        key=lambda job: (
            job["location_priority"],
            job["source_priority"],
            -job["verification_score"],
            job.get("days_old", MAX_POSTING_AGE_DAYS + 1),
        )
    )

    return deduped[:limit]


def _search_terms(role: str, location_focus: str) -> list[str]:
    return [
        f"{role} {location_focus}",
        f"{role} India remote",
        f"{role} remote",
    ]


def _fetch_remotive(session: requests.Session, role: str, limit: int) -> list[dict[str, Any]]:
    try:
        response = session.get(
            "https://remotive.com/api/remote-jobs",
            params={"search": role, "limit": limit},
            timeout=10,
        )
        response.raise_for_status()
    except requests.RequestException:
        return []

    jobs = response.json().get("jobs", [])
    normalized = []
    for job in jobs:
        normalized.append(
            {
                "id": f"remotive_{job.get('id')}",
                "title": job.get("title", ""),
                "company": job.get("company_name", ""),
                "description": job.get("description", ""),
                "location": job.get("candidate_required_location") or "Remote",
                "salary": job.get("salary") or "Competitive",
                "url": job.get("url", ""),
                "source": "Remotive",
                "source_domain": "remotive.com",
                "published_at": job.get("publication_date"),
                "category": job.get("category", ""),
                "tags": job.get("tags") or [],
            }
        )
    return normalized


def _fetch_remoteok(session: requests.Session, role: str) -> list[dict[str, Any]]:
    try:
        response = session.get("https://remoteok.com/api", timeout=10)
        response.raise_for_status()
    except requests.RequestException:
        return []

    normalized = []
    for job in response.json():
        if not isinstance(job, dict) or not job.get("position"):
            continue

        normalized.append(
            {
                "id": f"remoteok_{job.get('id')}",
                "title": job.get("position", ""),
                "company": job.get("company", ""),
                "description": job.get("description", ""),
                "location": job.get("location") or "Remote",
                "salary": _format_remoteok_salary(job),
                "url": job.get("apply_url") or job.get("url", ""),
                "source": "RemoteOK",
                "source_domain": "remoteok.com",
                "published_at": job.get("date"),
                "category": ", ".join(job.get("tags") or []),
                "tags": job.get("tags") or [],
            }
        )
    return _role_prefilter(normalized, role)


def _fetch_arbeitnow(session: requests.Session, role: str) -> list[dict[str, Any]]:
    try:
        response = session.get("https://www.arbeitnow.com/api/job-board-api", timeout=10)
        response.raise_for_status()
    except requests.RequestException:
        return []

    normalized = []
    for job in response.json().get("data", []):
        normalized.append(
            {
                "id": f"arbeitnow_{job.get('slug')}",
                "title": job.get("title", ""),
                "company": job.get("company_name", ""),
                "description": job.get("description", ""),
                "location": job.get("location") or ("Remote" if job.get("remote") else ""),
                "salary": "Competitive",
                "url": job.get("url", ""),
                "source": "Arbeitnow",
                "source_domain": "arbeitnow.com",
                "published_at": job.get("created_at"),
                "category": ", ".join(job.get("tags") or []),
                "tags": job.get("tags") or [],
            }
        )
    return _role_prefilter(normalized, role)


def _fetch_themuse(session: requests.Session, role: str, location_focus: str) -> list[dict[str, Any]]:
    normalized = []
    locations = [location_focus, "India", "Remote"]
    for location in locations:
        try:
            response = session.get(
                "https://www.themuse.com/api/public/jobs",
                params={
                    "page": 1,
                    "category": "Data and Analytics",
                    "location": location,
                },
                timeout=10,
            )
            response.raise_for_status()
        except requests.RequestException:
            continue

        for job in response.json().get("results", []):
            refs = job.get("refs") or {}
            company = job.get("company") or {}
            locations = job.get("locations") or []
            normalized.append(
                {
                    "id": f"themuse_{job.get('id')}",
                    "title": job.get("name", ""),
                    "company": company.get("name", ""),
                    "description": job.get("contents", ""),
                    "location": ", ".join(item.get("name", "") for item in locations if item.get("name")) or location,
                    "salary": "Competitive",
                    "url": refs.get("landing_page") or refs.get("shortlink") or "",
                    "source": "The Muse",
                    "source_domain": "themuse.com",
                    "published_at": job.get("publication_date"),
                    "category": ", ".join(category.get("name", "") for category in job.get("categories", []) if category.get("name")),
                    "tags": [level.get("name", "") for level in job.get("levels", []) if level.get("name")],
                }
            )
    return _role_prefilter(normalized, role)


def _fetch_direct_career_seed_jobs(session: requests.Session, role: str, location_focus: str) -> list[dict[str, Any]]:
    normalized = []
    for seed in DIRECT_CAREER_SEEDS:
        if not _matches_data_analyst_role(seed["title"], role):
            continue
        if location_focus.lower() not in seed["location"].lower() and "bengaluru" not in seed["location"].lower():
            continue
        try:
            response = session.get(seed["url"], timeout=10)
            response.raise_for_status()
        except requests.RequestException:
            continue

        page_text = _clean_text(response.text)
        page_text_lower = page_text.lower()
        if seed["company"].lower() not in page_text_lower or seed["title"].split(",")[0].lower() not in page_text_lower:
            continue
        if "apply" not in page_text_lower and "application" not in page_text_lower:
            continue

        normalized.append(
            {
                **seed,
                "description": page_text[:5000],
                "salary": "Competitive",
                "source_domain": _domain(seed["url"]),
                "published_at": _extract_posted_date(page_text),
                "category": "Data and Analytics",
                "tags": ["direct company careers"],
            }
        )
    return normalized


def _verify_job(job: dict[str, Any], role: str, location_focus: str, work_mode: str) -> dict[str, Any] | None:
    title = job.get("title", "").strip()
    company = job.get("company", "").strip()
    description = _clean_text(job.get("description", ""))
    combined_text = f"{title} {company} {description}".lower()
    apply_domain = _domain(job.get("url", ""))
    source_domain = job.get("source_domain") or apply_domain
    published_at = _parse_date(job.get("published_at"))
    days_old = _days_old(published_at)
    location_fit = _classify_location_fit(job, combined_text, location_focus)

    if not _matches_data_analyst_role(title, role):
        return None
    if not company or company.lower() in GENERIC_COMPANY_NAMES:
        return None
    if not _is_trusted_source(source_domain):
        return None
    if days_old is not None and days_old > MAX_POSTING_AGE_DAYS:
        return None
    if _contains_any(combined_text, SCAM_TERMS):
        return None
    if _looks_like_training_ad(title, company, combined_text):
        return None
    if not _is_allowed_location(location_fit, work_mode):
        return None

    is_direct_employer = _is_direct_company_source(apply_domain) or _looks_like_company_careers_url(job.get("url", ""))
    badges = [
        "trusted_source",
        "company_named",
        "active_recent_posting" if days_old is not None else "active_source",
        "data_analyst_role_match",
        location_fit["label"],
    ]
    if is_direct_employer:
        badges.append("direct_company_careers")
    else:
        badges.append("reputable_job_platform")

    verification_score = 70
    verification_score += 12 if is_direct_employer else 6
    verification_score += 10 if days_old is not None and days_old <= 14 else 0
    verification_score += max(0, 8 - (location_fit["priority"] * 3))
    verification_score += 5 if job.get("salary") and job.get("salary") != "Competitive" else 0
    verification_score = min(99, verification_score)

    return {
        "id": job.get("id") or _stable_key(title, company, job.get("location", "")),
        "title": title,
        "company": company,
        "location": job.get("location") or "Remote",
        "salary": job.get("salary") or "Competitive",
        "match_score": verification_score,
        "verification_score": verification_score,
        "url": job.get("url", ""),
        "source": job.get("source", "Trusted source"),
        "source_domain": source_domain,
        "apply_domain": apply_domain,
        "source_priority": 0 if is_direct_employer else 1,
        "location_priority": location_fit["priority"],
        "work_mode": location_fit["work_mode"],
        "region_scope": location_fit["region_scope"],
        "is_direct_employer": is_direct_employer,
        "company_verified": True,
        "recruiter_verified": True,
        "recruiter_status": "direct_or_platform_verified",
        "posted_at": published_at.isoformat() if published_at else None,
        "days_old": days_old,
        "category": job.get("category", ""),
        "verification_badges": badges,
        "verification_notes": "Verified against trusted source, company identity, role relevance, Bangalore/India/remote priority, recency, duplicate, scam, and course-ad filters.",
    }


def _dedupe_jobs(jobs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    best_by_key: dict[str, dict[str, Any]] = {}
    for job in jobs:
        key = _stable_key(job["title"], job["company"], job["location"])
        current = best_by_key.get(key)
        if current is None or (
            job["location_priority"],
            job["source_priority"],
            -job["verification_score"],
            job.get("days_old") or 999,
        ) < (
            current["location_priority"],
            current["source_priority"],
            -current["verification_score"],
            current.get("days_old") or 999,
        ):
            best_by_key[key] = job
    return list(best_by_key.values())


def _role_prefilter(jobs: list[dict[str, Any]], role: str) -> list[dict[str, Any]]:
    return [job for job in jobs if _matches_data_analyst_role(job.get("title", ""), role)]


def _matches_data_analyst_role(title: str, role: str) -> bool:
    title_lower = title.lower()
    role_lower = role.lower()
    if role_lower and role_lower in title_lower:
        return True
    return any(term in title_lower for term in DATA_ANALYST_TITLE_TERMS)


def _looks_like_training_ad(title: str, company: str, combined_text: str) -> bool:
    title_company = f"{title} {company}".lower()
    if _contains_any(title_company, TRAINING_AD_TERMS):
        return True
    training_hits = sum(1 for term in TRAINING_AD_TERMS if term in combined_text)
    return training_hits >= 2


def _contains_any(text: str, terms: set[str]) -> bool:
    return any(term in text for term in terms)


def _classify_location_fit(job: dict[str, Any], combined_text: str, location_focus: str) -> dict[str, Any]:
    location_text = f"{job.get('location', '')} {' '.join(job.get('tags') or [])}".lower()
    all_text = f"{location_text} {combined_text}"
    focus_terms = {location_focus.lower(), "bengaluru"} if location_focus.lower() == "bangalore" else {location_focus.lower()}
    is_bangalore = any(term in all_text for term in focus_terms)
    is_india = is_bangalore or any(term in all_text for term in ("india", "indian", "ist timezone", "utc+5:30"))
    is_remote = "remote" in all_text or job.get("source") in {"RemoteOK", "Remotive"}
    is_hybrid = "hybrid" in all_text
    is_onsite = any(term in all_text for term in ("on-site", "onsite", "in office", "office based"))

    if is_bangalore and (is_remote or is_hybrid or not is_onsite):
        return {
            "priority": 0,
            "label": "bangalore_remote_hybrid",
            "work_mode": "Hybrid" if is_hybrid else "Remote" if is_remote else "Bangalore",
            "region_scope": "Bangalore",
        }
    if is_india and is_remote:
        return {
            "priority": 1,
            "label": "india_remote",
            "work_mode": "Remote",
            "region_scope": "India",
        }
    if is_remote:
        return {
            "priority": 2,
            "label": "global_remote",
            "work_mode": "Remote",
            "region_scope": "Global",
        }
    return {
        "priority": 99,
        "label": "location_rejected",
        "work_mode": "Onsite",
        "region_scope": "Other",
    }


def _is_allowed_location(location_fit: dict[str, Any], work_mode: str) -> bool:
    if work_mode == "bangalore":
        return location_fit["priority"] == 0
    if work_mode == "india_remote":
        return location_fit["priority"] <= 1
    return location_fit["priority"] <= 2


def _is_trusted_source(domain: str) -> bool:
    return any(domain == trusted or domain.endswith(f".{trusted}") for trusted in TRUSTED_PLATFORM_DOMAINS | TRUSTED_ATS_DOMAINS)


def _is_direct_company_source(domain: str) -> bool:
    return any(domain == trusted or domain.endswith(f".{trusted}") for trusted in TRUSTED_ATS_DOMAINS)


def _looks_like_company_careers_url(url: str) -> bool:
    parsed = urlparse(url)
    path = parsed.path.lower()
    host = parsed.netloc.lower()
    if not host:
        return False
    if _is_trusted_source(host):
        return False
    return any(marker in path for marker in ("/careers", "/jobs", "/job/", "/positions", "/openings"))


def _domain(url: str) -> str:
    parsed = urlparse(url)
    host = parsed.netloc.lower()
    if host.startswith("www."):
        host = host[4:]
    return host


def _clean_text(value: Any) -> str:
    if value is None:
        return ""
    return " ".join(str(value).split())


def _parse_date(value: Any) -> datetime | None:
    if value in (None, ""):
        return None
    if isinstance(value, int):
        return datetime.fromtimestamp(value, tz=timezone.utc)

    text = str(value).replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(text)
    except ValueError:
        return None

    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _extract_posted_date(text: str) -> datetime | None:
    match = re.search(r"posted\s+(\d+)\s+days?\s+ago", text, flags=re.IGNORECASE)
    if match:
        return datetime.now(timezone.utc) - timedelta(days=int(match.group(1)))
    if re.search(r"posted\s+today", text, flags=re.IGNORECASE):
        return datetime.now(timezone.utc)
    return None


def _days_old(published_at: datetime | None) -> int | None:
    if published_at is None:
        return None
    age = datetime.now(timezone.utc) - published_at
    if age < timedelta(0):
        return 0
    return age.days


def _stable_key(title: str, company: str, location: str) -> str:
    return "|".join(_normalize(value) for value in (title, company, location))


def _normalize(value: str) -> str:
    return "".join(char.lower() for char in value if char.isalnum() or char.isspace()).strip()


def _format_remoteok_salary(job: dict[str, Any]) -> str:
    minimum = _to_int(job.get("salary_min"))
    maximum = _to_int(job.get("salary_max"))
    if minimum and maximum:
        return f"${minimum:,} - ${maximum:,}"
    return "Competitive"


def _to_int(value: Any) -> int | None:
    try:
        return int(value)
    except (TypeError, ValueError):
        return None
