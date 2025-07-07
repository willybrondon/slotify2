import React from "react";
import { ExInput, Textarea } from "../../extras/Input";
import { useDispatch, useSelector } from "react-redux";
import { closeDialog } from "../../../redux/slice/dialogueSlice";


const SalonRequestDialogue = () => {
  const dispatch = useDispatch();
  const { dialogueData } = useSelector((state) => state.dialogue);

  console.log('dialogueData', dialogueData)

  return (
    <div className="dialog focusNone">
      <div class="w-100">
        <div class="row justify-content-center">
          <div class="col-xl-4 col-md-6 col-11">
            <div class="mainDiaogBox">
              <div class="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h2 className="text-theme m0">Salon request info</h2>
                </div>
                <div className="col-4">
                  <div
                    className="closeButton"
                    onClick={() => {
                      dispatch(closeDialog());
                    }}
                  >
                    <i className="ri-close-line"></i>
                  </div>
                </div>
              </div>
              <div className="row align-items-start formBody">
                <div className="col-6">
                  <ExInput
                    value={dialogueData?.mobile}
                    label={`Mobile`}
                    placeholder={`Details`}
                    readOnly={true}
                  />
                </div>

                <div className="col-6">
                  <ExInput
                    value={dialogueData?.expertCount}
                    label={`Expert count`}
                    placeholder={`Details`}
                    readOnly={true}
                  />
                </div>
                {/* <div className="col-12 col-md-6">
                  <ExInput
                    type={`text`}
                    value={
                      dialogueData?.userId?.fname
                        ? dialogueData?.userId.fname +
                          " " +
                          dialogueData?.userId?.lname
                        : "-"
                    }
                    label={
                      dialogueData?.expertId
                        ? "Expert"
                        : dialogueData.userId
                        ? "User"
                        : ""
                    }
                    placeholder={
                      dialogueData?.expertId
                        ? "Expert"
                        : dialogueData.userId
                        ? "User"
                        : ""
                    }
                    readOnly={true}
                  />
                </div> */}


                <div className="col-12">
                  <Textarea
                    value={dialogueData?.about}
                    label={`Details`}
                    placeholder={`Details`}
                    readOnly={true}
                  />
                </div>
                <div className="col-12">
                  <Textarea
                    value={dialogueData?.address}
                    label={`Address`}
                    placeholder={`Details`}
                    readOnly={true}
                  />
                </div>

                
                {dialogueData?.image ? (
                  <div className="col-6">
                    <label className="d-block">Image</label>
                    <img
                      src={dialogueData?.image ? dialogueData?.image : 'image not found'}
                      alt=""
                      draggable="false"
                      data-class={`showImage`}
                      style={{
                        width: "100px",
                        height: "100px",
                        marginTop: "5px",
                      }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonRequestDialogue;
