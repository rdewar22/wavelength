import './UploadAvatar.css'
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { selectCurrentUserName } from "../auth/authSlice";
import { updateProfilePic } from "../auth/authSlice";
import {
  Form,
  Button,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { useNewProfPicMutation } from "../users/usersApiSlice";

const UploadAvatar = ({
  avatarUrl,
  reloadParent
}) => {
  const [modal, setModal] = useState(false);
  const [file, setFile] = useState(null);
  const [newProfPic, { isLoading, error }] = useNewProfPicMutation();
  const userName = useSelector(selectCurrentUserName);
  const dispatch = useDispatch();
  console.assert(userName !== null, "%o", "User can't be null in UploadAvatar")


  const toggle = () => {
    setModal(!modal);
  };

  const handleFileChange = ({ target: { files } }) => {
    if (files?.length) {
      const { type } = files[0];
      if (type === "image/png" || type === "image/jpeg") {
        setFile(files[0]);
      } else {
        toast.error("Only png and jpeg image types are allowed*", {
          hideProgressBar: true,
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("File is required*", {
        hideProgressBar: true,
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file); // Append the file (key should match backend expectation)
      // formData.append('name', userName); // Append additional fields

      const result = await newProfPic({ userName, formData }).unwrap();
      
      // Update the user's profile picture URL in Redux with timestamp cache busting
      const newProfilePicUri = `https://robby-wavelength-test.s3.us-east-2.amazonaws.com/profile-pictures/${userName}_profPic.jpeg?v=${Date.now()}`;
      dispatch(updateProfilePic({ profilePicUri: newProfilePicUri }));
      
      setFile(null);
      setModal(false);
      reloadParent();
      toast.success("Profile picture uploaded successfully!", {
        hideProgressBar: true,
      });
    } catch (error) {
      console.error('Upload error:', error);

      let errorMessage = "Failed to upload profile picture. Please try again.";

      // Check for specific error types
      if (error?.data?.message?.includes('File too large') ||
        error?.error?.includes('File too large') ||
        error?.message?.includes('File too large')) {
        errorMessage = "The file is too large. Please upload a smaller image.";
      } else if (error?.data?.message?.includes('invalid file type') ||
        error?.error?.includes('invalid file type') ||
        error?.message?.includes('invalid file type')) {
        errorMessage = "Invalid file type. Please upload an image (JPG, PNG, etc.).";
      } else if (error?.status === 413) {
        errorMessage = "The file is too large. Maximum upload size exceeded.";
      } else if (error?.status === 400) {
        errorMessage = "Invalid request. Please check the file and try again.";
      } else if (error?.status === 401) {
        errorMessage = "Unauthorized. Please login again.";
      }

      toast.error(errorMessage, {
        position: "top-center",
        hideProgressBar: true,
        autoClose: 5000,
      });
    }
  };

  return (
    <div>
      <Button size="sm" onClick={toggle}>
        {`${avatarUrl ? "Change" : "Upload"} picture`}
      </Button>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>{`${avatarUrl ? "Change" : "Upload"
          } your photo`}</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="exampleFile">File</Label>
              <Input
                type="file"
                name="file"
                id="exampleFile"
                onChange={handleFileChange}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSubmit}>
            Upload
          </Button>
          <Button color="secondary" onClick={toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default UploadAvatar;