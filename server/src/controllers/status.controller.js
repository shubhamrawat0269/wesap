import Status from "../models/status.model.js";
import response from "../config/responseHandler.js";
import uploadOnCloudinary from "../services/cloudinary.service.js";

const createStatus = async (req, res) => {
  try {
    const { contentType, content } = req.body;
    const file = req.file;
    const userId = req.user.userId;

    let mediaUrl = null;
    let finalContentType = contentType || "text";

    if (file) {
      const uploadFile = await uploadOnCloudinary(file);

      if (!uploadFile?.secure_url) {
        return response(res, 400, "Failed to upload media");
      }

      mediaUrl = uploadFile?.secure_url;

      // TODO : How to set content type
      //   console.log(file.mimetype, "FILE TYPE");
      if (file.mimetype.startWith("image")) finalContentType = "image";
      else if (file.mimetype.startWith("video")) finalContentType = "video";
      else return response(res, 400, "Unsupported File Type");
    } else if (content?.trim()) {
      finalContentType = "text";
    } else {
      return response(res, 400, "Message Content is Required");
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const status = new Status({
      user: userId,
      content: mediaUrl || content,
      contentType: finalContentType,
      expiresAt,
    });

    await status.save();

    const populateStatus = await Status.findOne(status._id)
      .populate("user", "username profilePicture")
      .populate("viewers", "username profilePicture");

    // emit socket event
    if (req.io && req.socketUserMap) {
      for (const [connectedUserId, socketId] of req.socketUserMap) {
        if (connectedUserId !== userId) {
          req.io.to(socketId).emit("new_status", populateStatus);
        }
      }
    }

    return response(res, 201, "Status Created Successfully", populateStatus);
  } catch (error) {
    console.error("CREATE STATUS CONTROLLER", error);
    return response(res, 500, "Internal Server Error");
  }
};

const getStatusList = async (req, res) => {
  try {
    const statusList = await Status.find({ expiresAt: { $gt: new Date() } })
      .populate("user", "username profilePicture")
      .populate("viewers", "username profilePicture")
      .sort({ createdAt: -1 });

    return response(res, 200, "Status Retrieved", statusList);
  } catch (error) {
    console.error(error.message);
    return response(res, 500, "Internal Server Error");
  }
};

const viewStatus = async (req, res) => {
  const { statusId } = req.params;
  const userId = req.user.userId;

  try {
    const status = await Status.findById(statusId);
    if (!status) {
      return response(res, 404, "Status Not Found");
    }
    if (!status.viewers.includes(userId)) {
      status.viewers.push(userId);
      await status.save();

      const updateStatus = await Status.findById(statusId)
        .populate("user", "username profilePicture")
        .populate("viewers", "username profilePicture");

      // emit socket event
      if (req.io && req.socketUserMap) {
        const statusOwnerSocketId = req.socketUserMap.get(
          status.user._id.toString(),
        );
        if (statusOwnerSocketId) {
          const viewData = {
            statusId,
            viewerId: userId,
            totalViewers: updateStatus.viewers.length,
            viewers: updateStatus.viewers,
          };

          req.io.to(statusOwnerSocketId).emit("status_viewed", viewData);
        } else {
          console.log("Status Owner Not Connected");
        }
      }
    } else {
      console.log("User already viewed the status");
    }

    return response(res, 200, "Status Viewed Successfully");
  } catch (error) {
    console.error(error.message);
    return response(res, 500, "Internal Server Error");
  }
};

const deleteStatus = async (req, res) => {
  const { statusId } = req.params;
  const userId = req.user.userId;

  try {
    const status = await Status.findById(statusId);
    if (!status) {
      return response(res, 404, "Status Not Found");
    }
    if (!status.user.toString() !== userId) {
      return response(res, 403, "User Not Authorized To Delete this status");
    }

    await status.deleteOne();

    // emit socket event
    if (req.io && req.socketUserMap) {
      for (const [connectedUserId, socketId] of req.socketUserMap) {
        if (connectedUserId !== userId) {
          req.io.to(socketId).emit("status_deleted", statusId);
        }
      }
    }

    return response(res, 200, "Status Deleted Successfully");
  } catch (error) {
    console.error(error.message);
    return response(res, 500, "Internal Server Error");
  }
};

export { createStatus, getStatusList, viewStatus, deleteStatus };
