import { Link, Outlet, useParams, useNavigate } from "react-router-dom";
import Header from "../Header.jsx";
import { useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../../util/http.js";
import { useState } from "react";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: event,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["events", id], //so we dont have same cached data for all events, but instead each id its own cached data
    queryFn: ({ signal }) => fetchEvent({ id: id, signal }),
  });

  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeleting,
    error: deleteError,
  } = useMutation({
    mutationKey: ["delete-event"],
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("../");
    },
  });

  function handleStartDelete() {
    setIsDeleting(true);
  }
  function handleCancelDelete() {
    setIsDeleting(false);
  }

  function handleDelete() {
    mutate({ id: id });
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleCancelDelete}>
          {isPendingDeletion && (
            <div className="center">
              <p>Deleting, please wait...</p>
            </div>
          )}
          {!isPendingDeletion && (
            <>
              <h2>Are You Sure ?</h2>
              <p>
                Do you really want to delete this event? This action cannot be
                undone.
              </p>
              <div className="form-actions">
                <button onClick={handleCancelDelete} className="button-text">
                  Cancel
                </button>
                <button onClick={handleDelete} className="button">
                  Delete
                </button>
              </div>
            </>
          )}
          {isErrorDeleting && (
            <ErrorBlock
              title="Failed to delete event."
              message={deleteError.info?.message || "Please try again later."}
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        {isPending && (
          <div className="center">
            <LoadingIndicator />
          </div>
        )}
        {event && (
          <>
            <header>
              <h1>{event.title}</h1>
              <nav>
                <button onClick={handleStartDelete}>Delete</button>
                <Link to="edit">Edit</Link>
              </nav>
            </header>
            <div id="event-details-content">
              <img
                src={"http://localhost:3000/" + event.image}
                alt={event.image}
              />
              <div id="event-details-info">
                <div>
                  <p id="event-details-location">{event.location}</p>
                  <time dateTime={`Todo-DateT$Todo-Time`}>
                    {event.date} @ {event.time}
                  </time>
                </div>
                <p id="event-details-description">{event.description}</p>
              </div>
            </div>
          </>
        )}
        {isError && (
          <div className="center">
            <ErrorBlock
              title="An error occurred"
              message={
                error.info?.message ||
                "Failed to fetch event data, please try again later"
              }
            />
          </div>
        )}
      </article>
    </>
  );
}
