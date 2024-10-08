/**
 * @description       :
 * @author            : Kuldeep Singh
 * @group             :
 * @last modified on  : 10-08-2024
 * @last modified by  : Kuldeep Singh
 **/
@isTest
public with sharing class ConvertCSVToStringCollectionTest {
    @isTest
    public static void canConvertString() {
        //String testString = 'foo,bar,baz';
        ConvertCSVToStringCollection.Request testReq = new ConvertCSVToStringCollection.Request();
        testReq.csvString = 'foo,bar,baz';

        List<ConvertCSVToStringCollection.Request> testReqList = new List<ConvertCSVToStringCollection.Request>();
        testReqList.add(testReq);

        List<ConvertCSVToStringCollection.Response> testResponseList = ConvertCSVToStringCollection.execute(
            testReqList
        );

        System.assertEquals(testResponseList[0].stringCollection[0], 'foo');
    }

    @isTest
    public static void canConvertStringWithDelimiter() {
        //String testString = 'foo,bar,baz';
        ConvertCSVToStringCollection.Request testReq = new ConvertCSVToStringCollection.Request();
        testReq.csvString = 'foo;bar;baz';
        testReq.delimiter = ';';

        List<ConvertCSVToStringCollection.Request> testReqList = new List<ConvertCSVToStringCollection.Request>();
        testReqList.add(testReq);

        List<ConvertCSVToStringCollection.Response> testResponseList = ConvertCSVToStringCollection.execute(
            testReqList
        );

        System.assertEquals(testResponseList[0].stringCollection[0], 'foo');
    }
}
