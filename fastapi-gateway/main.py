from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import date

app = FastAPI(title="Room Availability Microservice")


class AvailabilityRequest(BaseModel):
    roomId: int
    date: str
    startTime: str
    endTime: str


DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "bookslot",
    "user": "postgres",
    "password": "postgres",
}


def get_connection():
    return psycopg2.connect(**DB_CONFIG)


@app.get("/")
def root():
    return {
        "message": "Room availability microservice is running",
        "docs": "/docs",
    }


@app.post("/check-availability")
def check_availability(payload: AvailabilityRequest):

    if payload.endTime <= payload.startTime:
        raise HTTPException(
            status_code=400,
            detail="endTime must be after startTime"
        )

    query = """
        SELECT 1
        FROM bookings
        WHERE resource_id = %s
          AND booking_date = %s
          AND status = 'CONFIRMED'
          AND %s < end_time
          AND %s > start_time
        LIMIT 1
    """

    try:
        with get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    query,
                    (
                        payload.roomId,
                        payload.date,
                        payload.startTime,
                        payload.endTime,
                    ),
                )

                existing_booking = cur.fetchone()

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {exc}"
        )

    if existing_booking:
        return {
            "available": False,
            "message": "Room already booked for selected time",
        }

    return {
        "available": True,
        "message": "Room is available",
    }


@app.get("/available-rooms")
def get_available_rooms():

    query = """
        SELECT
            id,
            name,
            location,
            capacity
        FROM resources
    """

    try:
        with get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query)
                rooms = cur.fetchall()

        return {
            "count": len(rooms),
            "rooms": rooms
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {exc}"
        )


@app.get("/occupied-rooms")
def get_occupied_rooms():

    query = """
        SELECT DISTINCT
            r.id,
            r.name,
            r.location
        FROM bookings b
        JOIN resources r
            ON b.resource_id = r.id
        WHERE b.booking_date = CURRENT_DATE
          AND b.status = 'CONFIRMED'
    """

    try:
        with get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query)
                rooms = cur.fetchall()

        return {
            "count": len(rooms),
            "rooms": rooms
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {exc}"
        )


@app.get("/health")
def health():
    return {
        "status": "UP",
        "service": "Room Availability Microservice"
    }