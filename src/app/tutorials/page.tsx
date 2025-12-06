import { Play } from 'lucide-react'
import styles from './page.module.css'

const TUTORIALS = [
    {
        id: 1,
        title: "How to Measure Your Hood",
        duration: "2:30",
        difficulty: "Beginner",
        views: "1.2k views"
    },
    {
        id: 2,
        title: "Installing the Refill Kit",
        duration: "15:00",
        difficulty: "Intermediate",
        views: "3.4k views"
    },
    {
        id: 3,
        title: "Using the Handheld Sewing Machine",
        duration: "8:45",
        difficulty: "Beginner",
        views: "5.1k views"
    },
    {
        id: 4,
        title: "Advanced Stitching Techniques",
        duration: "12:20",
        difficulty: "Advanced",
        views: "800 views"
    },
    {
        id: 5,
        title: "Preparing Your Hoodie for Mail-in",
        duration: "3:15",
        difficulty: "Beginner",
        views: "2.1k views"
    },
    {
        id: 6,
        title: "Care & Maintenance",
        duration: "4:00",
        difficulty: "All Levels",
        views: "1.5k views"
    }
]

export default function TutorialsPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Tutorials</h1>
                <p className={styles.description}>
                    Master the art of hoodie customization with our step-by-step video guides.
                </p>
            </div>

            <div className={styles.grid}>
                {TUTORIALS.map((video) => (
                    <div key={video.id} className={styles.card}>
                        <div className={styles.thumbnail}>
                            <div className={styles.playButton}>
                                <Play fill="white" size={24} />
                            </div>
                        </div>
                        <div className={styles.content}>
                            <div className={styles.videoMeta}>
                                <span>{video.duration}</span>
                                <span>{video.views}</span>
                            </div>
                            <h3 className={styles.videoTitle}>{video.title}</h3>
                            <span className={styles.difficulty}>{video.difficulty}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
