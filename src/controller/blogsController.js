
const blogsModel = require("../model/blogsmodel");
let authorModel = require("../model/authormodel");



//============================================= Blog create ======================================================//


const createBlog = async function (req, res) {
  try {
    let blogs = req.body;
    let condition = await authorModel.findById(blogs.authorId);
    if (condition) {
      if (blogs.isPublished == true) {            
        blogs.publishedAt = Date.now();
        let savedData = await blogsModel.create(blogs);
        res.status(201).send({ data: savedData });
      } else if(blogs.isPublished==false){
        blogs.publishedAt=null;
        let savedData = await blogsModel.create(blogs);
        res.status(201).send({ data: savedData });
      }

    } else {
      res.status(400).send({ status: false, msg: "authorId is not present" });
    }
  } catch (err) {
    res.status(500).send({ msg: "error", error: err.message })
  }
}


//============================================= Get blogs ============================================================//



const getAllBlogs = async (req, res) => {
  try {
    let blogData = req.query;
    let allBlogs = await blogsModel
      .find({ $and: [{ isDeleted: false }, { isPublished: true }, blogData] })
      .populate("authorId");
    if (!allBlogs) {
      return res.status(400).send({ msg: "not valid" });
    }
    res.status(200).send({ status: true, msg: allBlogs });
  } catch (err) {
    res.status(500).send({ staus: false, error: err.message });
  }
};


//============================================== Update Blogs =====================================================//


const updatedBlogsData = async function (req, res) {
  try{
  let getId = req.params.blogId;
  let data = req.body;
  let checkId = await blogsModel.findOne({ _id: getId });
  if (checkId) {
    if (checkId.isDeleted === false) {
      let checkData = await blogsModel.findByIdAndUpdate(
        getId,
        {
          $push: { tags: data.tags, subcategory: data.subcategory },
          title: data.title,
          body: data.body,
          isPublished: data.isPublished,
          publishedAt: Date.now(),
        },
        { new: true }
      );
      res.status(200).send({ status: true, data: checkData });
    } else {
      res.status(404).send("File is not present or Deleted");
    }
  } else {
    res.status(404).send({ status: false, msg: "please enter valid blog id" });
  }
   }catch(error){
    res.status(400).send({status:false,error:error.message})
  }
}

//=========================================== Delete by params ========================================================//



const deletedByParams = async function (req, res) {
  try {
    let blogid = req.params.blogId;
    if (!blogid) {
      return res.status(400).send({ msg: "blogId is not valid" });
    }
    let findBlockid = await blogsModel.findById(blogid);
    if (!findBlockid) {
      return res.status(404).send({ msg: " block is not exits" });
    }
    if (findBlockid.isDeleted == false) {
      let finddata = await blogsModel.findOneAndUpdate(
        { _id: blogid },
        { $set: { isDeleted: true, deletedAt: Date.now() } },
        { new: true }
      );
      res.status(200).send({ staus: true });
    } else {
      res.status(404).send({ msg: "file is already deleted" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
};


//=========================================== Delete By query ========================================================//


  
 const deleteByQuery = async (req, res) => {
   try {
     let data = req.query;
     let allBlogs = await blogsModel.find(data);
    if (allBlogs.length == 0) {
      return res.status(400).send({ status: false, msg: "No blog found" });
    }
      
       let deletedData = await blogsModel.updateMany(
         { isDeleted: false },
         { $set: { isDeleted: true, deletedAt: Date.now() } },
         { new: true }
      );
  if (deletedData.modifiedCount == 0) return res.status(404).send({ status: false, msg: "No Such BLog Or the blog already is Deleted" });
      
     res.status(200).send({ status: true, msg: deletedData });

      
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};


//========================================= module exports ========================================================//


module.exports.createBlog = createBlog;

module.exports.getAllBlogs = getAllBlogs;

module.exports.updatedBlogsData = updatedBlogsData;

module.exports.deletedByParams = deletedByParams;

module.exports.deleteByQuery = deleteByQuery;
