import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = functions.https.onRequest(async (request, response) => {
//     functions.logger.info("Hello logs!", { structuredData: true });
//     response.send("Hello from Firebase!");
// });


export const getAllExamsMeta = functions.https.onRequest(async (request, response) => {
    admin.initializeApp();
    var scheduleExamsDoc;
    try {
        console.log("getAllExamsMeta : function Start");
        scheduleExamsDoc = await admin.firestore().collection("schedule-exam").get();
        console.log("getAllExamsMeta : data fetchedt");
        var scheduleExams = [];
        for (var i = 0; i < scheduleExamsDoc.size; i++) {
            var name = scheduleExamsDoc.docs[i].data()['name'];
            var id = scheduleExamsDoc.docs[i].id;
            if (name == undefined || name == null) {
                console.log("getAllExamsMeta:  data missing : error");
                throw new functions.https.HttpsError("internal", 'Missing Data');
            }
            scheduleExams.push({
                "name": name,
                "id": id,
            });
        }
        response.status(200).send({ "data": scheduleExams });
        console.log("getAllExamsMeta :  data sent");
    } catch (error) {
        console.log("getAllExamsMeta: Exception", error);

        response.status(500).send({ "error": "Internal Error" });
        throw new functions.https.HttpsError("internal", 'Internal Error');
    }
});

export const getStudentsOfExam = functions.https.onRequest(async (request, response) => {
    console.log("getStudentsOfExam : function Start");
    admin.initializeApp();
    if (request.body["examID"] == undefined) {
        console.log("getStudentsOfExam :  missing data error");

        throw new functions.https.HttpsError("invalid-argument", 'Invalid Arguments');
    }
    var examsDoc: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;

    try {
        examsDoc = await admin.firestore().collectionGroup("exams").where("exam id", '==', request.body["examID"]).get();
        console.log("getStudentsOfExam :  data fetched");

        var examData = [];
        for (var i = 0; i < examsDoc.size; i++) {
            var studentDoc;
            studentDoc = await examsDoc.docs[i].ref.parent.parent?.get();
            var studentName = studentDoc?.data["name"];
            var marksObtained = examsDoc.docs[i].data()['marksObtained'];
            var maxMarks = examsDoc.docs[i].data()['maxMarks'];
            examData.push({
                "studentName": studentName,
                "marksObtained": marksObtained,
                "maxMarks": maxMarks,
            });
        }
        console.log("getStudentsOfExam :  data sent");

        response.status(200).send({ "data": examData });
    } catch (error) {
        response.status(500).send({ "error": "Internal Error" });
        console.log("getStudentsOfExam: Exception", error);

        throw new functions.https.HttpsError("internal", 'Internal Error');
    }

});


export const getExamsOfStudent = functions.https.onRequest(async (request, response) => {
    console.log("getExamsOfStudent :  function Start");
    admin.initializeApp();
    if (request.body["studentID"] == undefined) {
        console.log("getExamsOfStudent :  missing data error");

        throw new functions.https.HttpsError("invalid-argument", 'Invalid Arguments');
    }
    var examsDoc: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;
    try {
        examsDoc = await admin.firestore().collection("students").doc(request.body["studentID"]).collection("exams").get();
        console.log("getExamsOfStudent :  data fetched");

        var examData = [];
        for (var i = 0; i < examsDoc.size; i++) {
            var marksObtained = examsDoc.docs[i].data()['marksObtained'];
            var maxMarks = examsDoc.docs[i].data()['maxMarks'];
            examData.push({
                "marksObtained": marksObtained,
                "maxMarks": maxMarks,
            });
        }
        console.log("getExamsOfStudent :  data sent");

        response.status(200).send({ "data": examData });
    } catch (error) {
        response.status(500).send({ "error": "Internal Error" });
        console.log("getExamsOfStudent: Exception", error);

        throw new functions.https.HttpsError("internal", 'Internal Error');
    }

});