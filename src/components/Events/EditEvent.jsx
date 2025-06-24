import { Link, useNavigate } from "react-router-dom";
import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useMutation } from "@tanstack/react-query";
import { queryClient, updateEvent } from "../../util/http.js";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchEvent } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: event,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["events", id], //so we dont have same cached data for all events, but instead each id its own cached data
    queryFn: ({ signal }) => fetchEvent({ id: id, signal }),
  });

  const { mutate } = useMutation({
    mutationKey: ["event", "edit-event"],
    mutationFn: updateEvent,
    onMutate: async (data) => {
      // cancel all ongoing queries for this key
      // to avoid clashes response from those queries and the optimistic updating
      // it doesnt cancel mutations only queries triggered by useQuery
      await queryClient.cancelQueries({ queryKey: ["events", id] });
      //gives us the currently stored data (in case update mutation failed and we wanna roll back)
      const previousEvent = queryClient.getQueriesData(["events", id]);
      //for optimistic updating
      //react query passes the data from mutate to onMutate data : { id: id, event: formData }
      queryClient.setQueryData(["events", id], data.event);
      return { previousEvent };
    },
    onError: (error, variables, context) => {
      //receives data from onMutate => context.previousEvent
      queryClient.setQueryData(["events", id], context.previousEvent);
    },
    onSettled: () => {
      // called whenever mutation is done no matter if it failed or not
      queryClient.invalidateQueries({ queryKey: ["events", id] });
    },
  });

  function handleSubmit(formData) {
    mutate({ id: id, event: formData });
    navigate("..");
  }

  function handleClose() {
    navigate("..");
  }

  let content;

  if (isPending) {
    content = (
      <div className="center">
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="An error occurred"
          message={
            error.info?.message ||
            "Failed to load event, please try again later."
          }
        />
        <div className="form-actions">
          <Link to={"../"} className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (event) {
    content = (
      <EventForm inputData={event} onSubmit={handleSubmit}>
        <Link to=".." className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}
